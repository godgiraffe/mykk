/**
 * 進度追蹤：記錄已處理的 tweetId，避免重複處理
 * 進度檔位於 x-bookmark-sync/.sync-progress.json
 */

import { existsSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";

const PROGRESS_PATH = join(import.meta.dir, "..", ".sync-progress.json");

interface ProcessedRecord {
  tweetId: string;
  category: string;
  filename: string;
}

interface ProgressData {
  /** 已成功處理的記錄 */
  processed: (string | ProcessedRecord)[];
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

function getTweetId(entry: string | ProcessedRecord): string {
  return typeof entry === "string" ? entry : entry.tweetId;
}

/** 檢查 tweetId 是否已處理過 */
export function isProcessed(tweetId: string): boolean {
  return load().processed.some((e) => getTweetId(e) === tweetId);
}

/** 取得已處理記錄的詳細資訊（category, filename） */
export function getProcessedInfo(tweetId: string): { category: string; filename: string } | null {
  const entry = load().processed.find((e) => getTweetId(e) === tweetId);
  if (!entry || typeof entry === "string") return null;
  return { category: entry.category, filename: entry.filename };
}

/** 標記 tweetId 為已處理（立即寫入磁碟） */
export function markProcessed(tweetId: string, category?: string, filename?: string) {
  const data = load();
  // 移除舊記錄（如重新處理）
  data.processed = data.processed.filter((e) => getTweetId(e) !== tweetId);
  if (category && filename) {
    data.processed.push({ tweetId, category, filename });
  } else {
    data.processed.push(tweetId);
  }
  save(data);
}

/** 取得已處理數量 */
export function getProcessedCount(): number {
  return load().processed.length;
}

/** 清除進度檔（全部重跑時使用） */
export function clearProgress() {
  save({ processed: [], lastUpdated: new Date().toISOString() });
}
