import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { readSessionFromCookieHeader } from "@/lib/session";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const session = await readSessionFromCookieHeader(
    request.headers.get("cookie"),
  );

  if (pathname.startsWith("/verify") && !session) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (pathname.startsWith("/dashboard")) {
    if (!session) {
      return NextResponse.redirect(new URL("/", request.url));
    }
    if (!session.faceVerified) {
      return NextResponse.redirect(new URL("/verify", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/verify", "/dashboard/:path*"],
};
