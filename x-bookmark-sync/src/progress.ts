/**
 * 進度追蹤：記錄已處理的 tweetId，避免重複處理
 * 進度檔位於 x-bookmark-sync/.sync-progress.json
 */

import { existsSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";

const PROGRESS_PATH = join(import.meta.dir, "..", ".sync-progress.json");

interface ProgressData {
  /** 已成功處理的 tweetId 集合 */
  processed: string[];
  /** 最後更新時間 */
  lastUpdated: string;
}

function load(): ProgressData {
  if (!existsSync(PROGRESS_PATH)) {
    return { processed: [], lastUpdated: new Date().toISOString() };
  }
  try {
    return JSON.parse(readFileSync(PROGRESS_PATH, "utf-8"));
  } catch {
    return { processed: [], lastUpdated: new Date().toISOString() };
  }
}

function save(data: ProgressData) {
  data.lastUpdated = new Date().toISOString();
  writeFileSync(PROGRESS_PATH, JSON.stringify(data, null, 2));
}

/** 檢查 tweetId 是否已處理過 */
export function isProcessed(tweetId: string): boolean {
  return load().processed.includes(tweetId);
}

/** 標記 tweetId 為已處理（立即寫入磁碟） */
export function markProcessed(tweetId: string) {
  const data = load();
  if (!data.processed.includes(tweetId)) {
    data.processed.push(tweetId);
    save(data);
  }
}

/** 取得已處理數量 */
export function getProcessedCount(): number {
  return load().processed.length;
}

/** 清除進度檔（全部重跑時使用） */
export function clearProgress() {
  save({ processed: [], lastUpdated: new Date().toISOString() });
}
