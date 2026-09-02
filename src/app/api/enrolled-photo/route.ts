import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { isAllowedReferencePath } from "@/lib/storage-paths";

export const runtime = "nodejs";

function mimeFromPath(filePath: string) {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === ".png") return "image/png";
  if (ext === ".webp") return "image/webp";
  return "image/jpeg";
}

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  const filePath = session.referenceImagePath;
  if (!filePath || !isAllowedReferencePath(filePath)) {
    return NextResponse.json({ error: "No enrolled photo." }, { status: 404 });
  }

  try {
    const bytes = await readFile(filePath);
    return new NextResponse(bytes, {
      headers: {
        "Content-Type": mimeFromPath(filePath),
        "Cache-Control": "private, no-store",
      },
    });
  } catch {
    return NextResponse.json({ error: "Enrolled photo not found." }, { status: 404 });
  }
}
