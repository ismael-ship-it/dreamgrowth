import type { MediaUploadPayload, MediaUploadRecord } from "@/lib/media/types";

const mockUploadedMedia: MediaUploadRecord[] = [];

export function createMediaUploadRecords(
  payload: MediaUploadPayload
): MediaUploadRecord[] {
  const timestamp = new Date().toISOString();
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
      status: "storage_pending",
      storageBucket: "project-media",
      storagePath: `demo-company/${id}-${safeName}`,
      createdAt: timestamp
    } satisfies MediaUploadRecord;
  });

  mockUploadedMedia.unshift(...records);
  return records;
}

export function listUploadedMedia() {
  return mockUploadedMedia;
}
