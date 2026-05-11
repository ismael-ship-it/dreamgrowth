import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export const APP_SESSION_COOKIE = "dreamgrowth_owner_session";
const SESSION_PAYLOAD = "dreamgrowth-owner-session";

function toHex(buffer: ArrayBuffer) {
  return Array.from(new Uint8Array(buffer))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

async function signSession(secret: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(SESSION_PAYLOAD)
  );

  return toHex(signature);
}

function getConfiguredPassword() {
  return process.env.DREAMGROWTH_APP_PASSWORD?.trim() ?? "";
}

function getSessionSecret() {
  return process.env.DREAMGROWTH_SESSION_SECRET?.trim() || getConfiguredPassword();
}

export function isAppProtectionEnabled() {
  return Boolean(getConfiguredPassword());
}

export async function createSessionToken() {
  const secret = getSessionSecret();

  if (!secret) {
    throw new Error(
      "DreamGrowth app protection is not configured. Add DREAMGROWTH_APP_PASSWORD first."
    );
  }

  return signSession(secret);
}

export async function verifyPassword(password: string) {
  const configuredPassword = getConfiguredPassword();

  if (!configuredPassword) {
    return true;
  }

  return password === configuredPassword;
}

export async function isAuthenticatedRequest(request: Request) {
  if (!isAppProtectionEnabled()) {
    return true;
  }

  const cookieHeader = request.headers.get("cookie") ?? "";
  const cookieValue = cookieHeader
    .split(";")
    .map((chunk) => chunk.trim())
    .find((chunk) => chunk.startsWith(`${APP_SESSION_COOKIE}=`))
    ?.slice(APP_SESSION_COOKIE.length + 1);

  if (!cookieValue) {
    return false;
  }

  return cookieValue === (await createSessionToken());
}

export async function requireAppSession() {
  if (!isAppProtectionEnabled()) {
    return;
  }

  const cookieStore = await cookies();
  const cookieValue = cookieStore.get(APP_SESSION_COOKIE)?.value;

  if (!cookieValue || cookieValue !== (await createSessionToken())) {
    redirect("/login");
  }
}
