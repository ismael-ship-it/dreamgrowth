import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";
import type { MediaUploadPayload, MediaUploadRecord } from "@/lib/media/types";

const storageDir = join(process.cwd(), ".dreamgrowth");
const storagePath = join(storageDir, "media-uploads.json");

export function createMediaUploadRecords(
  payload: MediaUploadPayload
): MediaUploadRecord[] {
  const timestamp = new Date().toISOString();
  const existing = listUploadedMedia();
  const records = payload.files.map((file, index) => {
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-").toLowerCase();
    const id = `media-${Date.now()}-${index}`;

    return {
      id,
      fileName: file.name,
      fileSize: file.size,
      mimeType: file.type,
      city: payload.city,
      state: payload.state,
      materialType: payload.materialType,
      serviceType: payload.serviceType,
      notes: payload.notes,
      projectDate: payload.projectDate,
      status: "uploaded",
      storageBucket: "project-media",
      storagePath: `demo-company/${id}-${safeName}`,
      createdAt: timestamp
    } satisfies MediaUploadRecord;
  });

  writeUploads([...records, ...existing].slice(0, 200));
  return records;
}

export function listUploadedMedia() {
  ensureStorageDir();

  if (!existsSync(storagePath)) {
    return [] as MediaUploadRecord[];
  }

  try {
    const raw = readFileSync(storagePath, "utf8");
    const parsed = JSON.parse(raw) as MediaUploadRecord[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [] as MediaUploadRecord[];
  }
}

function writeUploads(records: MediaUploadRecord[]) {
  ensureStorageDir();
  writeFileSync(storagePath, JSON.stringify(records, null, 2), "utf8");
}

function ensureStorageDir() {
  if (!existsSync(storageDir)) {
    mkdirSync(storageDir, { recursive: true });
  }
}
