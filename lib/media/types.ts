export type MediaUploadRecord = {
  id: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  city: string;
  state: string;
  materialType: string;
  serviceType: string;
  notes?: string;
  projectDate?: string;
  status: "uploaded" | "storage_pending";
  storageBucket: string;
  storagePath: string;
  createdAt: string;
};

export type MediaUploadPayload = {
  files: Array<{
    name: string;
    size: number;
    type: string;
  }>;
  city: string;
  state: string;
  materialType: string;
  serviceType: string;
  notes?: string;
  projectDate?: string;
};
