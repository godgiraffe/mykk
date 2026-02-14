/**
 * Gemini API wrapper with retry logic for rate limits and timeouts
 */

import { GoogleGenAI } from "@google/genai";

const MAX_RETRIES = 3;
const POST_CALL_WAIT = 30_000; // 成功後等待 30 秒

export async function generateWithRetry(
  ai: GoogleGenAI,
  contents: string
): Promise<string> {
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents,
      });
      // 成功後等待，避免觸發 rate limit
      await new Promise((r) => setTimeout(r, POST_CALL_WAIT));
      return response.text || "";
    } catch (error: any) {
      const msg = error?.message || "";
      const errorStr = typeof error === "string" ? error : JSON.stringify(error);
      const is429 = errorStr.includes("429") || errorStr.includes("RESOURCE_EXHAUSTED");
      const isTimeout = msg.includes("timed out") || msg.includes("timeout") || msg.includes("ETIMEDOUT");

      if (attempt < MAX_RETRIES && (is429 || isTimeout)) {
        const reason = is429 ? "Rate limit" : "Timeout";
        const waitSec = is429 ? (attempt + 1) * 30 : (attempt + 1) * 10;
        console.log(`   ⏳ ${reason}，等待 ${waitSec} 秒後重試 (${attempt + 1}/${MAX_RETRIES})...`);
        await new Promise((r) => setTimeout(r, waitSec * 1000));
        continue;
      }
      throw error;
    }
  }
  throw new Error("超過最大重試次數");
}
