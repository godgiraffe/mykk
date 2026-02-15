/**
 * Claude CLI wrapper — 用 `claude -p` 取代 Gemini API
 * 分類用 Haiku（快），生成文章用 Sonnet（品質好）
 */

export type ClaudeModel = "haiku" | "sonnet" | "opus";

const MODEL_IDS: Record<ClaudeModel, string> = {
  haiku: "claude-haiku-4-5-20251001",
  sonnet: "claude-sonnet-4-5-20250929",
  opus: "claude-opus-4-6",
};

const MAX_RETRIES = 3;

export async function claudeGenerate(
  prompt: string,
  model: ClaudeModel = "sonnet"
): Promise<string> {
  const modelId = MODEL_IDS[model];

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const proc = Bun.spawn(
        ["claude", "-p", "--model", modelId],
        {
          stdin: new Response(prompt),
          stdout: "pipe",
          stderr: "pipe",
          env: { ...process.env, CLAUDECODE: "" },
        }
      );

      const output = await new Response(proc.stdout).text();
      const exitCode = await proc.exited;

      if (exitCode !== 0) {
        const stderr = await new Response(proc.stderr).text();
        throw new Error(`claude CLI 失敗 (exit ${exitCode}): ${stderr}`);
      }

      return output.trim();
    } catch (error: any) {
      const msg = error?.message || "";
      const isRetryable =
        msg.includes("rate") ||
        msg.includes("timeout") ||
        msg.includes("overloaded");

      if (attempt < MAX_RETRIES && isRetryable) {
        const waitSec = (attempt + 1) * 10;
        console.log(
          `   ⏳ 重試中，等待 ${waitSec} 秒 (${attempt + 1}/${MAX_RETRIES})...`
        );
        await new Promise((r) => setTimeout(r, waitSec * 1000));
        continue;
      }
      throw error;
    }
  }
  throw new Error("超過最大重試次數");
}
