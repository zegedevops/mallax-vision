import { NextResponse } from "next/server";
import { registerMerchant } from "@/lib/merchant-store";
import { saveReferenceImageToDemoFolder } from "@/lib/save-reference-image";
import { sessionFromMerchant, setSessionCookie } from "@/lib/session";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const form = await request.formData().catch(() => null);
  if (!form) {
    return NextResponse.json({ error: "Invalid registration form." }, { status: 400 });
  }

  const email = String(form.get("email") ?? "").trim().toLowerCase();
  const password = String(form.get("password") ?? "");
  const name = String(form.get("name") ?? "").trim();
  const image = form.get("referenceImage");

  if (!email || !email.includes("@")) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }
  if (password.length < 8) {
    return NextResponse.json(
      { error: "Password must be at least 8 characters." },
      { status: 400 },
    );
  }
  if (!(image instanceof File) || image.size === 0) {
    return NextResponse.json(
      { error: "Upload a reference face photo." },
      { status: 400 },
    );
  }

  const merchantId = `merch_${crypto.randomUUID().slice(0, 8)}`;

  try {
    const images = await saveReferenceImageToDemoFolder(image, merchantId);
    const merchant = await registerMerchant({
      id: merchantId,
      email,
      password,
      name: name || email.split("@")[0] || "Merchant",
      ...images,
    });

    await setSessionCookie(sessionFromMerchant(merchant));

    return NextResponse.json({
      ok: true,
      next: "/verify",
      merchant: {
        name: merchant.name,
        email: merchant.email,
        storeName: merchant.storeName,
      },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to create the account.";
    const status = message.includes("already exists") ? 409 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
