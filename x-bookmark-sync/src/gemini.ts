/**
 * Gemini API wrapper with retry logic for rate limits
 */

import { GoogleGenAI } from "@google/genai";

const MAX_RETRIES = 3;

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
      // 每次成功呼叫後等待 30 秒，避免觸發 rate limit
      await new Promise((r) => setTimeout(r, 30_000));
      return response.text || "";
    } catch (error: any) {
      const errorStr = typeof error === "string" ? error : JSON.stringify(error);
      const is429 = errorStr.includes("429") || errorStr.includes("RESOURCE_EXHAUSTED");

      if (is429 && attempt < MAX_RETRIES) {
        // 從錯誤中提取建議的等待時間，或預設等待
        const waitSec = (attempt + 1) * 30;
        console.log(`   ⏳ Rate limit，等待 ${waitSec} 秒後重試 (${attempt + 1}/${MAX_RETRIES})...`);
        await new Promise((r) => setTimeout(r, waitSec * 1000));
        continue;
      }
      throw error;
    }
  }
  throw new Error("超過最大重試次數");
}
