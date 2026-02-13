/**
 * OAuth 2.0 PKCE 初次認證設定
 * 執行：bun run setup
 *
 * 流程：
 * 1. 啟動本地 HTTP server (localhost:3000)
 * 2. 生成授權 URL 並開啟瀏覽器
 * 3. 使用者在瀏覽器中授權
 * 4. Callback 接收 authorization code
 * 5. 交換取得 Access Token + Refresh Token
 * 6. 儲存到 .env
 */

import { TwitterApi } from "twitter-api-v2";
import { loadEnv, saveEnv } from "./auth";

const CALLBACK_URL = "http://localhost:3000/callback";
const SCOPES = [
  "bookmark.read",
  "bookmark.write",
  "tweet.read",
  "users.read",
  "offline.access",
];

async function setup() {
  const env = loadEnv();

  if (!env.X_CLIENT_ID || !env.X_CLIENT_SECRET) {
    console.error("❌ 請先在 .env 中填入 X_CLIENT_ID 和 X_CLIENT_SECRET");
    console.error("   參考 .env.example");
    process.exit(1);
  }

  console.log("🔐 開始 OAuth 2.0 PKCE 認證流程...\n");

  // 建立 OAuth2 client
  const client = new TwitterApi({
    clientId: env.X_CLIENT_ID,
    clientSecret: env.X_CLIENT_SECRET,
  });

  // 生成授權 URL
  const { url, codeVerifier, state } = client.generateOAuth2AuthLink(
    CALLBACK_URL,
    { scope: SCOPES }
  );

  console.log("📋 請在瀏覽器中開啟以下連結並授權：\n");
  console.log(`   ${url}\n`);

  // 嘗試自動開啟瀏覽器
  try {
    const proc = Bun.spawn(["open", url]);
    await proc.exited;
    console.log("🌐 已自動開啟瀏覽器\n");
  } catch {
    console.log("⚠️  無法自動開啟瀏覽器，請手動複製上面的連結\n");
  }

  // 啟動本地 server 等待 callback
  console.log("⏳ 等待授權回調...\n");

  const tokenPromise = new Promise<{ accessToken: string; refreshToken: string }>(
    (resolve, reject) => {
      const server = Bun.serve({
        port: 3000,
        async fetch(req) {
          const reqUrl = new URL(req.url);

          if (reqUrl.pathname !== "/callback") {
            return new Response("Not Found", { status: 404 });
          }

          const code = reqUrl.searchParams.get("code");
          const returnedState = reqUrl.searchParams.get("state");

          if (!code || returnedState !== state) {
            reject(new Error("授權失敗：state 不匹配或缺少 code"));
            return new Response("授權失敗", { status: 400 });
          }

          try {
            // 交換 code 取得 tokens
            const tokenClient = new TwitterApi({
              clientId: env.X_CLIENT_ID,
              clientSecret: env.X_CLIENT_SECRET,
            });

            const result = await tokenClient.loginWithOAuth2({
              code,
              codeVerifier,
              redirectUri: CALLBACK_URL,
            });

            resolve({
              accessToken: result.accessToken,
              refreshToken: result.refreshToken!,
            });

            // 延遲關閉 server
            setTimeout(() => server.stop(), 500);

            return new Response(
              "<html><body><h1>✅ 授權成功！</h1><p>你可以關閉此頁面了。</p></body></html>",
              { headers: { "Content-Type": "text/html; charset=utf-8" } }
            );
          } catch (err) {
            reject(err);
            return new Response("Token 交換失敗", { status: 500 });
          }
        },
      });

      // 超時處理（3 分鐘）
      setTimeout(() => {
        server.stop();
        reject(new Error("授權超時（3 分鐘）"));
      }, 180_000);
    }
  );

  const { accessToken, refreshToken } = await tokenPromise;

  // 儲存 tokens 到 .env
  env.X_ACCESS_TOKEN = accessToken;
  env.X_REFRESH_TOKEN = refreshToken;
  saveEnv(env);

  // 驗證認證
  const authedClient = new TwitterApi(accessToken);
  const me = await authedClient.v2.me();

  console.log(`✅ 認證成功！已連結帳號：@${me.data.username}`);
  console.log("   Access Token 和 Refresh Token 已儲存到 .env");
  console.log("\n🚀 現在可以執行 bun run sync 來同步書籤了！");
}

setup().catch((err) => {
  console.error("❌ 認證失敗：", err.message || err);
  process.exit(1);
});
