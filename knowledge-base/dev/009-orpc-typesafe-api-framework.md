---
title: "oRPC：端到端類型安全的 API 框架"
date: "2025-12-08"
tags: 
  - "TypeScript"
  - "API 開發"
  - "類型安全"
summary: "oRPC 是一個結合 **RPC (Remote Procedure Call)** 和 **OpenAPI** 的強大框架，旨在構建端到端類型安全且符合 OpenAPI 標準的 API。官方網站：orpc.dev"
curationStatus: "inbox"
usefulnessScore: 64
noveltyScore: 49
evergreenScore: 67
priorityScore: 62
curationNote: "先檢查外部連結是否值得保留，再決定是否轉入精選。"
source:
  tweetUrl: "https://x.com/Manjusaka_Lee/status/1998030917961666632"
  externalUrl: "https://github.com/unnoq/orpc"
  authorUsername: "Manjusaka_Lee"
---

# oRPC：端到端類型安全的 API 框架

> **來源**: [@Manjusaka_Lee](https://x.com/Manjusaka_Lee/status/1998030917961666632) | [原文連結](https://github.com/unnoq/orpc)
>
> **日期**: Mon Dec 08 14:04:27 +0000 2025
>
> **標籤**: `TypeScript` `API 開發` `類型安全`

---

好的，我已經成功抓取到完整內容。現在讓我整理成知識庫文章的正文部分：

---

## 框架簡介

oRPC 是一個結合 **RPC (Remote Procedure Call)** 和 **OpenAPI** 的強大框架，旨在構建端到端類型安全且符合 OpenAPI 標準的 API。官方網站：[orpc.dev](https://orpc.dev)

## 核心特性總覽

| 特性分類 | 說明 |
|---------|------|
| **類型安全** | 🔗 端到端類型安全：從客戶端到伺服器確保輸入、輸出、錯誤的類型安全 |
| **標準支持** | 📘 First-Class OpenAPI：內建完整支持 OpenAPI 標準<br>🔠 標準 Schema 支持：原生支援 Zod、Valibot、ArkType 等驗證器<br>🗃️ 原生類型：支援 Date、File、Blob、BigInt、URL 等原生類型 |
| **開發模式** | 📝 合約優先開發：可選擇先定義 API 合約再實作 |
| **可觀測性** | 🔍 First-Class OpenTelemetry：無縫整合 OpenTelemetry |
| **框架整合** | ⚙️ TanStack Query (React/Vue/Solid/Svelte/Angular)、SWR、Pinia Colada 等<br>🚀 React Server Actions：完全相容 Next.js、TanStack Start 等平台 |
| **進階功能** | 📡 SSE & Streaming：完整的類型安全 SSE 和串流支持<br>⏱️ Lazy Router：透過延遲路由提升冷啟動速度 |
| **多平台支持** | 🌍 多運行環境：快速且輕量，支援 Cloudflare、Deno、Bun、Node.js 等 |
| **擴展性** | 🔌 易於擴展：支援 plugins、middleware、interceptors |

## 套件生態系統

oRPC 採用模組化設計，提供以下核心套件：

### 核心套件
- `@orpc/contract` - 構建 API 合約
- `@orpc/server` - 構建 API 或實作 API 合約
- `@orpc/client` - 客戶端類型安全的 API 消費
- `@orpc/openapi` - 生成 OpenAPI 規格並處理 OpenAPI 請求

### 整合套件
- `@orpc/otel` - OpenTelemetry 可觀測性整合
- `@orpc/nest` - 深度整合 NestJS
- `@orpc/react` - React 和 React Server Actions 工具
- `@orpc/tanstack-query` - TanStack Query 整合
- `@orpc/experimental-react-swr` - SWR 整合
- `@orpc/vue-colada` - Pinia Colada 整合
- `@orpc/hey-api` - Hey API 整合

### Schema 驗證器
- `@orpc/zod` - Zod 尚未支援的額外 schemas
- `@orpc/valibot` - 從 Valibot 生成 OpenAPI 規格
- `@orpc/arktype` - 從 ArkType 生成 OpenAPI 規格

## 快速入門範例

### 1. 定義 Router

使用 Zod 定義 schema 並建立 procedures：

```typescript
import type { IncomingHttpHeaders } from 'node:http'
import { ORPCError, os } from '@orpc/server'
import * as z from 'zod'

const PlanetSchema = z.object({
  id: z.number().int().min(1),
  name: z.string(),
  description: z.string().optional(),
})

export const listPlanet = os
  .input(
    z.object({
      limit: z.number().int().min(1).max(100).optional(),
      cursor: z.number().int().min(0).default(0),
    }),
  )
  .handler(async ({ input }) => {
    return [{ id: 1, name: 'name' }]
  })

export const findPlanet = os
  .input(PlanetSchema.pick({ id: true }))
  .handler(async ({ input }) => {
    return { id: 1, name: 'name' }
  })

export const createPlanet = os
  .$context<{ headers: IncomingHttpHeaders }>()
  .use(({ context, next }) => {
    const user = parseJWT(context.headers.authorization?.split(' ')[1])
    if (user) {
      return next({ context: { user } })
    }
    throw new ORPCError('UNAUTHORIZED')
  })
  .input(PlanetSchema.omit({ id: true }))
  .handler(async ({ input, context }) => {
    return { id: 1, name: 'name' }
  })

export const router = {
  planet: {
    list: listPlanet,
    find: findPlanet,
    create: createPlanet
  }
}
```

### 2. 建立伺服器

使用 `RPCHandler` 處理請求：

```typescript
import { createServer } from 'node:http'
import { RPCHandler } from '@orpc/server/node'
import { CORSPlugin } from '@orpc/server/plugins'

const handler = new RPCHandler(router, {
  plugins: [new CORSPlugin()]
})

const server = createServer(async (req, res) => {
  const result = await handler.handle(req, res, {
    context: { headers: req.headers }
  })

  if (!result.matched) {
    res.statusCode = 404
    res.end('No procedure matched')
  }
})

server.listen(3000, '127.0.0.1', () => console.log('Listening on 127.0.0.1:3000'))
```

### 3. 建立客戶端

使用 `createORPCClient` 建立類型安全的客戶端：

```typescript
import type { RouterClient } from '@orpc/server'
import { createORPCClient } from '@orpc/client'
import { RPCLink } from '@orpc/client/fetch'

const link = new RPCLink({
  url: 'http://127.0.0.1:3000',
  headers: { Authorization: 'Bearer token' },
})

export const orpc: RouterClient<typeof router> = createORPCClient(link)
```

### 4. 消費 API

完全類型安全的 API 調用：

```typescript
import { orpc } from './client'

const planets = await orpc.planet.list({ limit: 10 })
```

### 5. 生成 OpenAPI 規格

自動生成符合標準的 OpenAPI 文件：

```typescript
import { OpenAPIGenerator } from '@orpc/openapi'
import { ZodToJsonSchemaConverter } from '@orpc/zod/zod4'

const generator = new OpenAPIGenerator({
  schemaConverters: [new ZodToJsonSchemaConverter()]
})

const spec = await generator.generate(router, {
  info: {
    title: 'Planet API',
    version: '1.0.0'
  }
})

console.log(spec)
```

## 設計靈感來源

oRPC 的設計受到以下專案啟發：

- **tRPC** - 開創端到端類型安全 RPC 的概念，影響類型安全 API 的發展
- **ts-rest** - 強調合約優先開發和 OpenAPI 整合，深度影響 oRPC 的功能設計

## 授權

採用 MIT License 開源授權。
