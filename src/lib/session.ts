import { cookies } from "next/headers";
import type { DemoMerchant } from "@/lib/merchants";

export const SESSION_COOKIE = "mv_session";

export type SessionPayload = {
  merchantId: string;
  email: string;
  name: string;
  role: string;
  storeName: string;
  storeDomain: string;
  referenceImagePath: string;
  referenceImageUrl: string;
  faceVerified: boolean;
  verifiedAt: string | null;
};

function getSecret() {
  return process.env.SESSION_SECRET ?? "mallax-vision-demo-secret-change-me";
}

function toBase64Url(bytes: ArrayBuffer | Uint8Array) {
  const view = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  let binary = "";
  for (const byte of view) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(value: string) {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

async function sign(data: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(getSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(data),
  );
  return toBase64Url(signature);
}

export async function encodeSession(payload: SessionPayload) {
  const body = toBase64Url(new TextEncoder().encode(JSON.stringify(payload)));
  const signature = await sign(body);
  return `${body}.${signature}`;
}

export async function decodeSession(token: string): Promise<SessionPayload | null> {
  const [body, signature] = token.split(".");
  if (!body || !signature) return null;

  const expected = await sign(body);
  if (expected.length !== signature.length) return null;

  let mismatch = 0;
  for (let i = 0; i < expected.length; i += 1) {
    mismatch |= expected.charCodeAt(i) ^ signature.charCodeAt(i);
  }
  if (mismatch !== 0) return null;

  try {
    const json = new TextDecoder().decode(fromBase64Url(body));
    const parsed = JSON.parse(json) as SessionPayload;
    return {
      ...parsed,
      referenceImagePath:
        parsed.referenceImagePath || "public/demo/reference-face.jpg",
      referenceImageUrl: parsed.referenceImageUrl || "/demo/reference-face.jpg",
    };
  } catch {
    return null;
  }
}

export function sessionFromMerchant(
  merchant: DemoMerchant,
  extras?: Partial<SessionPayload>,
): SessionPayload {
  return {
    merchantId: merchant.id,
    email: merchant.email,
    name: merchant.name,
    role: merchant.role,
    storeName: merchant.storeName,
    storeDomain: merchant.storeDomain,
    referenceImagePath: merchant.referenceImagePath,
    referenceImageUrl: merchant.referenceImageUrl,
    faceVerified: false,
    verifiedAt: null,
    ...extras,
  };
}

export async function readSessionFromCookieHeader(cookieHeader: string | null) {
  if (!cookieHeader) return null;
  const match = cookieHeader
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${SESSION_COOKIE}=`));
  if (!match) return null;
  const value = decodeURIComponent(match.slice(SESSION_COOKIE.length + 1));
  return decodeSession(value);
}

export async function getSession() {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return decodeSession(token);
}

export async function setSessionCookie(payload: SessionPayload) {
  const store = await cookies();
  store.set(SESSION_COOKIE, await encodeSession(payload), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 8,
    secure: process.env.NODE_ENV === "production",
  });
}

export async function clearSessionCookie() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}
