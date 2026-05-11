"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Camera,
  CheckCircle2,
  Clock3,
  ImagePlus,
  Link2,
  Loader2,
  QrCode,
  Smartphone,
  Upload
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { MediaUploadRecord } from "@/lib/media/types";

const materialOptions = ["Quartz", "Granite", "Marble", "Quartzite", "Dekton", "Neolith"];
const serviceOptions = [
  "Countertop installation",
  "Kitchen island",
  "Bathroom vanity",
  "Bar top",
  "Stone fabrication",
  "Showroom slab"
];

type UploadStatus = "idle" | "uploading" | "uploaded" | "error";

export function MediaUploader({
  mobile = false,
  defaults
}: {
  mobile?: boolean;
  defaults?: {
    primaryCity?: string;
    primaryState?: string;
    serviceOptions?: string[];
  };
}) {
  const availableServiceOptions =
    defaults?.serviceOptions?.length ? defaults.serviceOptions : serviceOptions;
  const [files, setFiles] = useState<File[]>([]);
  const [city, setCity] = useState(defaults?.primaryCity ?? "Northborough");
  const [state, setState] = useState(defaults?.primaryState ?? "MA");
  const [materialType, setMaterialType] = useState("Quartz");
  const [serviceType, setServiceType] = useState(
    availableServiceOptions[0] ?? "Countertop installation"
  );
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState<UploadStatus>("idle");
  const [message, setMessage] = useState("");
  const [recentUploads, setRecentUploads] = useState<MediaUploadRecord[]>([]);
  const [loadingUploads, setLoadingUploads] = useState(true);

  const mobileUploadUrl = useMemo(() => {
    if (typeof window === "undefined") return "/media/mobile-upload";
    return `${window.location.origin}/media/mobile-upload`;
  }, []);
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(mobileUploadUrl)}`;

  useEffect(() => {
    async function loadUploads() {
      try {
        const response = await fetch("/api/media/uploads", {
          cache: "no-store"
        });

        if (!response.ok) {
          throw new Error("Could not load uploads");
        }

        const result = (await response.json()) as {
          uploads?: MediaUploadRecord[];
        };
        setRecentUploads(result.uploads ?? []);
      } catch {
        setRecentUploads([]);
      } finally {
        setLoadingUploads(false);
      }
    }

    void loadUploads();
  }, []);

  async function submitUpload() {
    setStatus("uploading");
    setMessage("");

    try {
      const response = await fetch("/api/media/uploads", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          files: files.map((file) => ({
            name: file.name,
            size: file.size,
            type: file.type
          })),
          city,
          state,
          materialType,
          serviceType,
          notes
        })
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const result = (await response.json()) as { uploads: unknown[] };
      setStatus("uploaded");
      setMessage(`${result.uploads.length} photo record(s) added to DreamGrowth.`);
      const uploadsResponse = await fetch("/api/media/uploads", {
        cache: "no-store"
      });

      if (uploadsResponse.ok) {
        const uploadsResult = (await uploadsResponse.json()) as {
          uploads?: MediaUploadRecord[];
        };
        setRecentUploads(uploadsResult.uploads ?? []);
      }
      setFiles([]);
      setNotes("");
    } catch {
      setStatus("error");
      setMessage("Could not register the upload. Check required fields and try again.");
    }
  }

  return (
    <div className="space-y-5">
      <section className="rounded-lg border border-border bg-card p-5 shadow-soft sm:p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-sm font-bold text-accent-foreground">
              Project Media
            </p>
            <h1 className="mt-2 text-3xl font-black tracking-tight">
              Upload real job photos from desktop or phone
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
              Add one or many photos, tag the city, material, and service, then
              DreamGrowth can turn them into local post drafts.
            </p>
          </div>
          <Badge variant="success">Local media library ready</Badge>
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-[1fr_340px]">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ImagePlus className="h-5 w-5 text-accent-foreground" />
              {mobile ? "Phone Upload" : "Upload Photos"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <label className="flex min-h-44 cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-border bg-muted/45 p-6 text-center">
              <Camera className="h-10 w-10 text-accent-foreground" />
              <span className="mt-3 text-sm font-bold">
                Choose project photos
              </span>
              <span className="mt-1 text-xs font-semibold text-muted-foreground">
                JPG, PNG, HEIC when supported by browser. Multiple files allowed.
              </span>
              <input
                className="sr-only"
                type="file"
                accept="image/*"
                multiple
                capture={mobile ? "environment" : undefined}
                onChange={(event) => {
                  setFiles(Array.from(event.target.files ?? []));
                  setStatus("idle");
                }}
              />
            </label>

            {files.length ? (
              <div className="grid gap-2 sm:grid-cols-2">
                {files.map((file) => (
                  <div
                    key={`${file.name}-${file.size}`}
                    className="rounded-md border border-border p-3 text-sm"
                  >
                    <div className="truncate font-bold">{file.name}</div>
                    <div className="mt-1 text-xs font-semibold text-muted-foreground">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </div>
                  </div>
                ))}
              </div>
            ) : null}

            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="City" value={city} onChange={setCity} />
              <Field label="State" value={state} onChange={setState} />
              <SelectField
                label="Material"
                value={materialType}
                onChange={setMaterialType}
                options={materialOptions}
              />
              <SelectField
                label="Service"
                value={serviceType}
                onChange={setServiceType}
                options={availableServiceOptions}
              />
            </div>

            <label className="block">
              <span className="text-xs font-bold uppercase text-muted-foreground">
                Notes
              </span>
              <textarea
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                className="mt-2 min-h-24 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                placeholder="Example: white quartz island, simple edge profile, installed in Northborough"
              />
            </label>

            <Button
              className="w-full"
              disabled={!files.length || status === "uploading"}
              onClick={submitUpload}
            >
              {status === "uploading" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : status === "uploaded" ? (
                <CheckCircle2 className="h-4 w-4" />
              ) : (
                <Upload className="h-4 w-4" />
              )}
              Add Photos
            </Button>

            {message ? (
              <div className="rounded-md bg-muted p-3 text-sm font-semibold">
                {message}
              </div>
            ) : null}
          </CardContent>
        </Card>

        {!mobile ? (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <QrCode className="h-5 w-5 text-accent-foreground" />
                Upload From Phone
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg border border-border bg-white p-4">
                <img
                  src={qrUrl}
                  alt="QR code for mobile upload"
                  className="mx-auto h-56 w-56"
                />
              </div>
              <p className="text-sm leading-6 text-muted-foreground">
                Scan this code on your phone, take photos at the job, and send
                them into DreamGrowth with city/material tags.
              </p>
              <Button asChild variant="outline" className="w-full">
                <a href={mobileUploadUrl}>
                  <Smartphone className="h-4 w-4" />
                  Open mobile upload
                </a>
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => navigator.clipboard.writeText(mobileUploadUrl)}
              >
                <Link2 className="h-4 w-4" />
                Copy link
              </Button>
            </CardContent>
          </Card>
        ) : null}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock3 className="h-5 w-5 text-accent-foreground" />
            Recent Project Uploads
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loadingUploads ? (
            <div className="text-sm font-semibold text-muted-foreground">
              Loading recent uploads...
            </div>
          ) : recentUploads.length ? (
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {recentUploads.slice(0, 9).map((upload) => (
                <div
                  key={upload.id}
                  className="rounded-lg border border-border bg-background p-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="truncate text-sm font-bold">
                      {upload.fileName}
                    </div>
                    <Badge variant="outline">{upload.materialType}</Badge>
                  </div>
                  <div className="mt-3 space-y-1 text-xs font-semibold text-muted-foreground">
                    <div>
                      {upload.serviceType} in {upload.city}, {upload.state}
                    </div>
                    <div>
                      Added {new Date(upload.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric"
                      })}
                    </div>
                    {upload.notes ? <div>{upload.notes}</div> : null}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-md border border-dashed border-border p-4 text-sm font-semibold text-muted-foreground">
              No project photos have been added yet. Upload the first completed job
              so DreamGrowth can build post drafts around real work.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function Field({
  label,
  value,
  onChange
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="text-xs font-bold uppercase text-muted-foreground">
        {label}
      </span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
      />
    </label>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
}) {
  return (
    <label className="block">
      <span className="text-xs font-bold uppercase text-muted-foreground">
        {label}
      </span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}
