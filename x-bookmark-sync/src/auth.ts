import { TwitterApi } from "twitter-api-v2";
import { readFileSync, writeFileSync, existsSync } from "fs";
import { join } from "path";

const ENV_PATH = join(import.meta.dir, "..", ".env");

export function loadEnv(): Record<string, string> {
  if (!existsSync(ENV_PATH)) return {};
  const content = readFileSync(ENV_PATH, "utf-8");
  const env: Record<string, string> = {};
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIndex = trimmed.indexOf("=");
    if (eqIndex === -1) continue;
    const key = trimmed.slice(0, eqIndex).trim();
    const value = trimmed.slice(eqIndex + 1).trim();
    env[key] = value;
  }
  return env;
}

export function saveEnv(env: Record<string, string>): void {
  const lines = [
    "# X API OAuth 2.0",
    `X_CLIENT_ID=${env.X_CLIENT_ID || ""}`,
    `X_CLIENT_SECRET=${env.X_CLIENT_SECRET || ""}`,
    "",
    "# OAuth tokens (由 setup 自動填入)",
    `X_ACCESS_TOKEN=${env.X_ACCESS_TOKEN || ""}`,
    `X_REFRESH_TOKEN=${env.X_REFRESH_TOKEN || ""}`,
    "",
    "# Claude API",
    `ANTHROPIC_API_KEY=${env.ANTHROPIC_API_KEY || ""}`,
  ];
  writeFileSync(ENV_PATH, lines.join("\n") + "\n");
}

export function getAuthenticatedClient(): TwitterApi {
  const env = loadEnv();
  if (!env.X_ACCESS_TOKEN) {
    throw new Error("尚未認證！請先執行 bun run setup");
  }
  return new TwitterApi(env.X_ACCESS_TOKEN);
}

export async function refreshTokenIfNeeded(): Promise<TwitterApi> {
  const env = loadEnv();
  if (!env.X_ACCESS_TOKEN || !env.X_REFRESH_TOKEN) {
    throw new Error("尚未認證！請先執行 bun run setup");
  }

  // 先嘗試用現有 token
  const client = new TwitterApi(env.X_ACCESS_TOKEN);
  try {
    await client.v2.me();
    return client;
  } catch (error: any) {
    // Token 過期，嘗試 refresh
    if (error?.code === 401 || error?.data?.status === 401) {
      console.log("⏳ Access token 已過期，正在更新...");
      const refreshClient = new TwitterApi({
        clientId: env.X_CLIENT_ID,
        clientSecret: env.X_CLIENT_SECRET,
      });

      const { accessToken, refreshToken } =
        await refreshClient.refreshOAuth2Token(env.X_REFRESH_TOKEN);

      env.X_ACCESS_TOKEN = accessToken;
      if (refreshToken) env.X_REFRESH_TOKEN = refreshToken;
      saveEnv(env);

      console.log("✅ Token 已更新");
      return new TwitterApi(accessToken);
    }
    throw error;
  }
}
