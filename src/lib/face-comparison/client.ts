import { readFile } from "node:fs/promises";
import path from "node:path";
import { buildComparisonRequest, normalizeComparisonResponse } from "@/lib/face-comparison/adapter";
import { getFaceComparisonConfig } from "@/lib/face-comparison/config";
import { mockCompareFaces } from "@/lib/face-comparison/mock";
import type {
  CompareFacesInput,
  FaceImagePayload,
  NormalizedFaceComparison,
} from "@/lib/face-comparison/types";

export class FaceComparisonError extends Error {
  constructor(
    message: string,
    public status = 502,
  ) {
    super(message);
    this.name = "FaceComparisonError";
  }
}

export async function loadReferenceImage(
  overridePath?: string,
): Promise<{
  image: FaceImagePayload;
  url?: string;
}> {
  const config = getFaceComparisonConfig();
  const referenceImagePath = overridePath || config.referenceImagePath;

  if (!overridePath && config.referenceImageUrl && config.sendReferenceAsUrl) {
    return {
      image: {
        bytes: new Uint8Array(),
        mimeType: "application/octet-stream",
        filename: "reference.jpg",
      },
      url: config.referenceImageUrl,
    };
  }

  if (!overridePath && config.referenceImageUrl) {
    const response = await fetch(config.referenceImageUrl);
    if (!response.ok) {
      throw new FaceComparisonError(
        "Could not download the configured reference face image.",
        500,
      );
    }
    const buffer = new Uint8Array(await response.arrayBuffer());
    return {
      image: {
        bytes: buffer,
        mimeType: response.headers.get("content-type") || "image/jpeg",
        filename: "reference.jpg",
      },
      url: config.referenceImageUrl,
    };
  }

  const absolute = path.isAbsolute(referenceImagePath)
    ? referenceImagePath
    : path.join(/* turbopackIgnore: true */ process.cwd(), referenceImagePath);

  try {
    const file = await readFile(absolute);
    return {
      image: {
        bytes: new Uint8Array(file),
        mimeType: absolute.endsWith(".png") ? "image/png" : "image/jpeg",
        filename: path.basename(absolute),
      },
    };
  } catch {
    throw new FaceComparisonError(
      `Reference face image not found at ${referenceImagePath}. Add the file or set FACE_COMPARISON_REFERENCE_IMAGE_URL.`,
      500,
    );
  }
}

function apiErrorMessage(raw: unknown, status: number) {
  if (raw && typeof raw === "object") {
    const record = raw as Record<string, unknown>;
    if (typeof record.error === "string" && record.error.trim()) return record.error;
    if (typeof record.message === "string" && record.message.trim()) {
      return record.message;
    }
  }
  return `Face comparison API returned ${status}.`;
}

export function resolveCompareFaceUrl(apiUrl: string) {
  const trimmed = apiUrl.replace(/\/+$/, "");
  if (!trimmed) return "";
  if (trimmed.endsWith("/compare-face")) return trimmed;
  return `${trimmed}/compare-face`;
}

async function callExternalApi(
  input: CompareFacesInput,
): Promise<NormalizedFaceComparison> {
  const config = getFaceComparisonConfig();
  const endpoint = resolveCompareFaceUrl(config.apiUrl);

  if (!endpoint) {
    throw new FaceComparisonError(
      "FACE_COMPARISON_API_URL is not set. Add it in .env.local.",
      500,
    );
  }

  const { headers, body } = buildComparisonRequest(config, input);
  const response = await fetch(endpoint, {
    method: "POST",
    headers,
    body,
    cache: "no-store",
  });

  const text = await response.text();
  let raw: unknown = text;
  try {
    raw = text ? JSON.parse(text) : null;
  } catch {
    raw = { unparsed: text.slice(0, 400) };
  }

  if (!response.ok) {
    const status = response.status >= 500 || response.status < 400 ? 502 : response.status;
    throw new FaceComparisonError(apiErrorMessage(raw, response.status), status);
  }

  const normalized = normalizeComparisonResponse(config, raw);

  return {
    ...normalized,
    provider: "api",
    message: normalized.match
      ? "The face-comparison API confirmed a match."
      : "The face-comparison API did not confirm a match.",
  };
}

/**
 * Isolated entry point for face verification.
 * Replace mock vs API behavior via environment variables without touching the UI.
 */
export async function compareCapturedFace(
  captured: FaceImagePayload,
  options?: { referenceImagePath?: string },
): Promise<NormalizedFaceComparison> {
  const config = getFaceComparisonConfig();
  const reference = await loadReferenceImage(options?.referenceImagePath);

  const input: CompareFacesInput = {
    captured,
    reference: reference.image,
    referenceUrl: reference.url,
  };

  if (config.useMock) {
    return mockCompareFaces(config);
  }

  return callExternalApi(input);
}
