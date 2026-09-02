import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import {
  DEMO_MERCHANT,
  merchantMatchesPassword,
  type DemoMerchant,
} from "@/lib/merchants";

const STORE_PATH = path.join(
  /* turbopackIgnore: true */ process.cwd(),
  "data",
  "registered-merchants.json",
);

async function readRegistered(): Promise<DemoMerchant[]> {
  try {
    const raw = await readFile(STORE_PATH, "utf8");
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isMerchantRecord);
  } catch {
    return [];
  }
}

function isMerchantRecord(value: unknown): value is DemoMerchant {
  if (!value || typeof value !== "object") return false;
  const record = value as Record<string, unknown>;
  return (
    typeof record.id === "string" &&
    typeof record.email === "string" &&
    typeof record.password === "string" &&
    typeof record.name === "string" &&
    typeof record.referenceImagePath === "string" &&
    typeof record.referenceImageUrl === "string"
  );
}

async function writeRegistered(merchants: DemoMerchant[]) {
  await mkdir(path.dirname(STORE_PATH), { recursive: true });
  await writeFile(STORE_PATH, JSON.stringify(merchants, null, 2), "utf8");
}

export async function findMerchantByEmail(email: string) {
  const normalized = email.trim().toLowerCase();
  if (normalized === DEMO_MERCHANT.email) return DEMO_MERCHANT;
  const registered = await readRegistered();
  return registered.find((merchant) => merchant.email === normalized) ?? null;
}

export async function authenticateMerchant(email: string, password: string) {
  const merchant = await findMerchantByEmail(email);
  if (!merchant || !merchantMatchesPassword(merchant, email, password)) {
    return null;
  }
  return merchant;
}

export async function registerMerchant(
  merchant: Omit<DemoMerchant, "role" | "storeName" | "storeDomain"> &
    Partial<Pick<DemoMerchant, "role" | "storeName" | "storeDomain">>,
) {
  const existing = await findMerchantByEmail(merchant.email);
  if (existing) {
    throw new Error("An account with this email already exists.");
  }

  const localPart = merchant.email.split("@")[0] || "store";
  const record: DemoMerchant = {
    ...merchant,
    email: merchant.email.trim().toLowerCase(),
    role: merchant.role ?? "Store owner",
    storeName: merchant.storeName ?? `${localPart} store`,
    storeDomain: merchant.storeDomain ?? `${localPart}.myshopify.com`,
  };

  const registered = await readRegistered();
  registered.push(record);
  await writeRegistered(registered);
  return record;
}
