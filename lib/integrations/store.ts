import { createCipheriv, createDecipheriv, createHash, randomBytes } from "crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";
import { getOptionalEnv } from "@/lib/env";

export type IntegrationProvider = "google" | "meta";
export type IntegrationStatus =
  | "not_connected"
  | "connected"
  | "expired"
  | "error"
  | "revoked";

type SensitivePayload = {
  accessToken?: string;
  refreshToken?: string;
  tokenType?: string;
};

type PersistedIntegrationRecord = {
  provider: IntegrationProvider;
  status: IntegrationStatus;
  displayName?: string;
  externalAccountId?: string;
  scopes: string[];
  expiresAt?: string;
  connectedAt?: string;
  updatedAt: string;
  lastSyncAt?: string;
  metadata: Record<string, unknown>;
  credentials?: string;
};

type PersistedIntegrationStore = {
  version: 1;
  integrations: Partial<Record<IntegrationProvider, PersistedIntegrationRecord>>;
};

export type IntegrationConnection = {
  provider: IntegrationProvider;
  status: IntegrationStatus;
  isConnected: boolean;
  displayName: string | null;
  externalAccountId: string | null;
  scopes: string[];
  expiresAt: string | null;
  connectedAt: string | null;
  updatedAt: string | null;
  lastSyncAt: string | null;
  metadata: Record<string, unknown>;
  hasRefreshToken: boolean;
};

export type IntegrationCredentials = {
  provider: IntegrationProvider;
  status: IntegrationStatus;
  accessToken: string | null;
  refreshToken: string | null;
  tokenType: string | null;
  expiresAt: string | null;
  scopes: string[];
  metadata: Record<string, unknown>;
  displayName: string | null;
  externalAccountId: string | null;
};

export type SaveIntegrationInput = {
  provider: IntegrationProvider;
  status?: IntegrationStatus;
  displayName?: string;
  externalAccountId?: string;
  scopes?: string[];
  expiresAt?: string;
  lastSyncAt?: string;
  metadata?: Record<string, unknown>;
  accessToken?: string;
  refreshToken?: string;
  tokenType?: string;
};

const storageDir = join(process.cwd(), ".dreamgrowth");
const storagePath = join(storageDir, "integrations.json");
const storageKeyPath = join(storageDir, "storage.key");

export function listIntegrationConnections() {
  return (["google", "meta"] as IntegrationProvider[]).map((provider) =>
    getIntegrationConnection(provider)
  );
}

export function getIntegrationConnection(
  provider: IntegrationProvider
): IntegrationConnection {
  const record = readStore().integrations[provider];
  const credentials = readCredentials(record);

  if (!record) {
    return emptyConnection(provider);
  }

  return {
    provider,
    status: record.status,
    isConnected: record.status === "connected",
    displayName: record.displayName ?? null,
    externalAccountId: record.externalAccountId ?? null,
    scopes: record.scopes ?? [],
    expiresAt: record.expiresAt ?? null,
    connectedAt: record.connectedAt ?? null,
    updatedAt: record.updatedAt ?? null,
    lastSyncAt: record.lastSyncAt ?? null,
    metadata: record.metadata ?? {},
    hasRefreshToken: Boolean(credentials?.refreshToken)
  };
}

export function getIntegrationCredentials(
  provider: IntegrationProvider
): IntegrationCredentials {
  const record = readStore().integrations[provider];

  if (!record) {
    return {
      provider,
      status: "not_connected",
      accessToken: null,
      refreshToken: null,
      tokenType: null,
      expiresAt: null,
      scopes: [],
      metadata: {},
      displayName: null,
      externalAccountId: null
    };
  }

  const credentials = readCredentials(record);

  return {
    provider,
    status: record.status,
    accessToken: credentials?.accessToken ?? null,
    refreshToken: credentials?.refreshToken ?? null,
    tokenType: credentials?.tokenType ?? null,
    expiresAt: record.expiresAt ?? null,
    scopes: record.scopes ?? [],
    metadata: record.metadata ?? {},
    displayName: record.displayName ?? null,
    externalAccountId: record.externalAccountId ?? null
  };
}

export function saveIntegrationConnection(input: SaveIntegrationInput) {
  const store = readStore();
  const existing = store.integrations[input.provider];
  const existingCredentials = readCredentials(existing);
  const nextCredentials: SensitivePayload = {
    accessToken: input.accessToken ?? existingCredentials?.accessToken,
    refreshToken: input.refreshToken ?? existingCredentials?.refreshToken,
    tokenType: input.tokenType ?? existingCredentials?.tokenType
  };
  const now = new Date().toISOString();

  store.integrations[input.provider] = {
    provider: input.provider,
    status: input.status ?? "connected",
    displayName: input.displayName ?? existing?.displayName,
    externalAccountId: input.externalAccountId ?? existing?.externalAccountId,
    scopes: input.scopes ?? existing?.scopes ?? [],
    expiresAt: input.expiresAt ?? existing?.expiresAt,
    connectedAt:
      existing?.connectedAt ??
      (input.status === "connected" || !input.status ? now : undefined),
    updatedAt: now,
    lastSyncAt: input.lastSyncAt ?? existing?.lastSyncAt ?? now,
    metadata: {
      ...(existing?.metadata ?? {}),
      ...(input.metadata ?? {})
    },
    credentials: hasAnyCredential(nextCredentials)
      ? writeCredentials(nextCredentials)
      : existing?.credentials
  };

  writeStore(store);
  return getIntegrationConnection(input.provider);
}

export function disconnectIntegration(provider: IntegrationProvider) {
  const store = readStore();
  delete store.integrations[provider];
  writeStore(store);
}

function emptyConnection(provider: IntegrationProvider): IntegrationConnection {
  return {
    provider,
    status: "not_connected",
    isConnected: false,
    displayName: null,
    externalAccountId: null,
    scopes: [],
    expiresAt: null,
    connectedAt: null,
    updatedAt: null,
    lastSyncAt: null,
    metadata: {},
    hasRefreshToken: false
  };
}

function ensureStorageDir() {
  if (!existsSync(storageDir)) {
    mkdirSync(storageDir, { recursive: true });
  }
}

function readStore(): PersistedIntegrationStore {
  ensureStorageDir();

  if (!existsSync(storagePath)) {
    return {
      version: 1,
      integrations: {}
    };
  }

  try {
    const raw = readFileSync(storagePath, "utf8");
    const parsed = JSON.parse(raw) as PersistedIntegrationStore;

    if (parsed.version !== 1 || !parsed.integrations) {
      return {
        version: 1,
        integrations: {}
      };
    }

    return parsed;
  } catch {
    return {
      version: 1,
      integrations: {}
    };
  }
}

function writeStore(store: PersistedIntegrationStore) {
  ensureStorageDir();
  writeFileSync(storagePath, JSON.stringify(store, null, 2), "utf8");
}

function writeCredentials(payload: SensitivePayload) {
  const plaintext = JSON.stringify(payload);
  const secret = getStorageSecret();
  const iv = randomBytes(12);
  const key = createHash("sha256").update(secret).digest();
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const encrypted = Buffer.concat([
    cipher.update(plaintext, "utf8"),
    cipher.final()
  ]);
  const tag = cipher.getAuthTag();

  return `enc:${iv.toString("base64url")}.${tag.toString("base64url")}.${encrypted.toString("base64url")}`;
}

function readCredentials(record?: PersistedIntegrationRecord | null) {
  if (!record?.credentials) {
    return null;
  }

  try {
    const [ivEncoded, tagEncoded, dataEncoded] = record.credentials
      .replace(/^enc:/, "")
      .split(".");
    const secret = getStorageSecret();
    const key = createHash("sha256").update(secret).digest();
    const decipher = createDecipheriv(
      "aes-256-gcm",
      key,
      Buffer.from(ivEncoded, "base64url")
    );

    decipher.setAuthTag(Buffer.from(tagEncoded, "base64url"));

    const decrypted = Buffer.concat([
      decipher.update(Buffer.from(dataEncoded, "base64url")),
      decipher.final()
    ]).toString("utf8");

    return JSON.parse(decrypted) as SensitivePayload;
  } catch {
    return null;
  }
}

function hasAnyCredential(payload: SensitivePayload) {
  return Boolean(payload.accessToken || payload.refreshToken || payload.tokenType);
}

function getStorageSecret() {
  const envSecret =
    getOptionalEnv("DREAMGROWTH_SESSION_SECRET") ??
    getOptionalEnv("DREAMGROWTH_APP_PASSWORD");

  if (envSecret) {
    return envSecret;
  }

  ensureStorageDir();

  if (!existsSync(storageKeyPath)) {
    writeFileSync(storageKeyPath, randomBytes(32).toString("hex"), "utf8");
  }

  return readFileSync(storageKeyPath, "utf8").trim();
}
