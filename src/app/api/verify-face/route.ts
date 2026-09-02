import { NextResponse } from "next/server";
import {
  compareCapturedFace,
  FaceComparisonError,
} from "@/lib/face-comparison";
import { getSession, setSessionCookie } from "@/lib/session";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json(
      { error: "Sign in before starting face verification." },
      { status: 401 },
    );
  }

  const form = await request.formData().catch(() => null);
  const file = form?.get("image");

  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json(
      { error: "A captured face image is required." },
      { status: 400 },
    );
  }

  if (file.size > 4 * 1024 * 1024) {
    return NextResponse.json(
      { error: "Captured image is too large. Try again with a smaller capture." },
      { status: 413 },
    );
  }

  const bytes = new Uint8Array(await file.arrayBuffer());

  try {
    const result = await compareCapturedFace(
      {
        bytes,
        mimeType: file.type || "image/jpeg",
        filename: "capture.jpg",
      },
      { referenceImagePath: session.referenceImagePath },
    );

    if (result.match) {
      await setSessionCookie({
        ...session,
        faceVerified: true,
        verifiedAt: new Date().toISOString(),
      });
    }

    return NextResponse.json({
      ok: true,
      match: result.match,
      score: result.score,
      threshold: result.threshold,
      provider: result.provider,
      message: result.message,
      raw: result.raw,
    });
  } catch (error) {
    if (error instanceof FaceComparisonError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    console.error(error);
    return NextResponse.json(
      { error: "Face verification failed unexpectedly." },
      { status: 500 },
    );
  }
}
