import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";
import type { GoogleIntegrationSummary } from "@/lib/google/types";
import type { MetaIntegrationSummary } from "@/lib/meta/types";

type SnapshotEnvelope<T> = {
  syncedAt: string;
  summary: T;
};

type SnapshotStore = {
  version: 1;
  google?: SnapshotEnvelope<GoogleIntegrationSummary>;
  meta?: SnapshotEnvelope<MetaIntegrationSummary>;
};

const storageDir = join(process.cwd(), ".dreamgrowth");
const storagePath = join(storageDir, "snapshots.json");

export function getGoogleSnapshot() {
  return readStore().google ?? null;
}

export function saveGoogleSnapshot(summary: GoogleIntegrationSummary) {
  const store = readStore();
  store.google = {
    syncedAt: new Date().toISOString(),
    summary
  };
  writeStore(store);
  return store.google;
}

export function getMetaSnapshot() {
  return readStore().meta ?? null;
}

export function saveMetaSnapshot(summary: MetaIntegrationSummary) {
  const store = readStore();
  store.meta = {
    syncedAt: new Date().toISOString(),
    summary
  };
  writeStore(store);
  return store.meta;
}

function ensureStorageDir() {
  if (!existsSync(storageDir)) {
    mkdirSync(storageDir, { recursive: true });
  }
}

function readStore(): SnapshotStore {
  ensureStorageDir();

  if (!existsSync(storagePath)) {
    return { version: 1 };
  }

  try {
    const parsed = JSON.parse(readFileSync(storagePath, "utf8")) as SnapshotStore;
    return parsed.version === 1 ? parsed : { version: 1 };
  } catch {
    return { version: 1 };
  }
}

function writeStore(store: SnapshotStore) {
  ensureStorageDir();
  writeFileSync(storagePath, JSON.stringify(store, null, 2), "utf8");
}
