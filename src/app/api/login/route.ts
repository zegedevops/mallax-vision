import { NextResponse } from "next/server";
import { authenticateMerchant } from "@/lib/merchant-store";
import { sessionFromMerchant, setSessionCookie } from "@/lib/session";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as {
    email?: string;
    password?: string;
  } | null;

  const email = body?.email ?? "";
  const password = body?.password ?? "";
  const merchant = await authenticateMerchant(email, password);

  if (!merchant) {
    return NextResponse.json(
      { error: "Invalid email or password." },
      { status: 401 },
    );
  }

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
}
