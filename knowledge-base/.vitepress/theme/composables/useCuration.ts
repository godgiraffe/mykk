export const CURATION_STORAGE_KEY = "article-curation";
export const CURATION_EVENT_NAME = "article-curation-updated";

export type CurationStatus = "inbox" | "curated" | "archive";

export interface CurationEntry {
  status: CurationStatus;
  updatedAt: string;
}

export type CurationMap = Record<string, CurationEntry>;

const STATUS_VALUES: CurationStatus[] = ["inbox", "curated", "archive"];

export function normalizeCurationStatus(
  value: unknown,
  fallback: CurationStatus = "inbox",
): CurationStatus {
  return typeof value === "string" && STATUS_VALUES.includes(value as CurationStatus)
    ? (value as CurationStatus)
    : fallback;
}

export function getCurationMap(): CurationMap {
  if (typeof localStorage === "undefined") return {};

  try {
    const raw = JSON.parse(localStorage.getItem(CURATION_STORAGE_KEY) || "{}");
    const result: CurationMap = {};

    for (const [url, entry] of Object.entries(raw)) {
      if (!entry || typeof entry !== "object") continue;

      const status = normalizeCurationStatus((entry as CurationEntry).status, "inbox");
      const updatedAt =
        typeof (entry as CurationEntry).updatedAt === "string"
          ? (entry as CurationEntry).updatedAt
          : new Date().toISOString();

      result[url] = { status, updatedAt };
    }

    return result;
  } catch {
    return {};
  }
}

function emitCurationUpdate() {
  window.dispatchEvent(new CustomEvent(CURATION_EVENT_NAME));
}

function writeCurationMap(map: CurationMap) {
  localStorage.setItem(CURATION_STORAGE_KEY, JSON.stringify(map));
  emitCurationUpdate();
}

export function setCuration(url: string, status: CurationStatus) {
  if (typeof localStorage === "undefined") return;

  const current = getCurationMap();
  current[url] = { status, updatedAt: new Date().toISOString() };
  writeCurationMap(current);
}

export function setManyCuration(urls: string[], status: CurationStatus) {
  if (typeof localStorage === "undefined" || urls.length === 0) return;

  const current = getCurationMap();
  const updatedAt = new Date().toISOString();

  for (const url of urls) {
    current[url] = { status, updatedAt };
  }

  writeCurationMap(current);
}

export function clearCuration(url: string) {
  if (typeof localStorage === "undefined") return;

  const current = getCurationMap();
  delete current[url];
  writeCurationMap(current);
}

export function clearManyCuration(urls: string[]) {
  if (typeof localStorage === "undefined" || urls.length === 0) return;

  const current = getCurationMap();

  for (const url of urls) {
    delete current[url];
  }

  writeCurationMap(current);
}

export function clearAllCuration() {
  if (typeof localStorage === "undefined") return;

  localStorage.removeItem(CURATION_STORAGE_KEY);
  emitCurationUpdate();
}

export function resolveCurationStatus(
  url: string,
  defaultStatus: CurationStatus,
  map: CurationMap,
): CurationStatus {
  return map[url]?.status ?? defaultStatus;
}

export function subscribeCuration(listener: () => void): () => void {
  if (typeof window === "undefined") return () => {};

  const onStorage = (event: StorageEvent) => {
    if (event.key && event.key !== CURATION_STORAGE_KEY) return;
    listener();
  };

  window.addEventListener("storage", onStorage);
  window.addEventListener(CURATION_EVENT_NAME, listener);

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(CURATION_EVENT_NAME, listener);
  };
}
