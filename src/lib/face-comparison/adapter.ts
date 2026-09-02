import type {
  CompareFacesInput,
  FaceComparisonConfig,
  NormalizedFaceComparison,
} from "@/lib/face-comparison/types";

function getByPath(source: unknown, path: string): unknown {
  if (!path) return source;
  return path.split(".").reduce<unknown>((current, key) => {
    if (current && typeof current === "object" && key in current) {
      return (current as Record<string, unknown>)[key];
    }
    return undefined;
  }, source);
}

function toNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function toBoolean(value: unknown): boolean | null {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (["true", "1", "yes", "match", "matched"].includes(normalized)) return true;
    if (["false", "0", "no", "mismatch"].includes(normalized)) return false;
  }
  if (typeof value === "number") return value > 0;
  return null;
}

function uint8ToBase64(bytes: Uint8Array) {
  let binary = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}

function toDataUrl(bytes: Uint8Array, mimeType: string) {
  return `data:${mimeType || "image/jpeg"};base64,${uint8ToBase64(bytes)}`;
}

/**
 * Builds the outbound HTTP request for the face-comparison API.
 * Live contract: POST JSON { referenceImage, capturedImage } as data URLs.
 */
export function buildComparisonRequest(
  config: FaceComparisonConfig,
  input: CompareFacesInput,
): { headers: Headers; body: BodyInit } {
  const headers = new Headers();

  if (config.apiKey) {
    headers.set(
      config.apiKeyHeader,
      `${config.apiKeyPrefix}${config.apiKey}`.trim(),
    );
  }

  if (config.requestFormat === "json") {
    headers.set("Content-Type", "application/json");

    const payload: Record<string, unknown> = {
      ...config.extraJson,
      [config.capturedImageField]: toDataUrl(
        input.captured.bytes,
        input.captured.mimeType,
      ),
      [config.referenceImageField]: config.sendReferenceAsUrl
        ? (input.referenceUrl ?? config.referenceImageUrl)
        : toDataUrl(input.reference.bytes, input.reference.mimeType),
    };

    return { headers, body: JSON.stringify(payload) };
  }

  const form = new FormData();

  for (const [key, value] of Object.entries(config.extraJson)) {
    form.append(key, typeof value === "string" ? value : JSON.stringify(value));
  }

  form.append(
    config.capturedImageField,
    new Blob([input.captured.bytes.slice()], { type: input.captured.mimeType }),
    input.captured.filename,
  );

  if (config.sendReferenceAsUrl) {
    form.append(
      config.referenceImageField,
      input.referenceUrl ?? config.referenceImageUrl,
    );
  } else {
    form.append(
      config.referenceImageField,
      new Blob([input.reference.bytes.slice()], {
        type: input.reference.mimeType,
      }),
      input.reference.filename,
    );
  }

  return { headers, body: form };
}

/**
 * Normalizes your API's response into the shape the UI understands.
 *
 * TODO: If your API uses different field names or nested paths, set
 * FACE_COMPARISON_RESPONSE_SCORE_PATH and FACE_COMPARISON_RESPONSE_MATCH_PATH
 * in `.env.local`. Example: `data.similarity` or `result.is_match`.
 *
 * If the match field is omitted, a match is inferred from score >= threshold.
 */
export function normalizeComparisonResponse(
  config: FaceComparisonConfig,
  raw: unknown,
): Omit<NormalizedFaceComparison, "provider" | "message"> {
  const score = toNumber(getByPath(raw, config.responseScorePath));
  const explicitMatch = config.responseMatchPath
    ? toBoolean(getByPath(raw, config.responseMatchPath))
    : null;

  const match =
    explicitMatch ?? (score !== null ? score >= config.matchThreshold : false);

  return {
    match,
    score,
    threshold: config.matchThreshold,
    raw,
  };
}
