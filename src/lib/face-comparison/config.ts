import type { FaceComparisonConfig, RequestFormat } from "@/lib/face-comparison/types";

function read(name: string, fallback = "") {
  return process.env[name]?.trim() || fallback;
}

function parseExtraJson(raw: string): Record<string, unknown> {
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      return parsed as Record<string, unknown>;
    }
  } catch {
    console.warn("FACE_COMPARISON_EXTRA_JSON is not valid JSON. Ignoring.");
  }
  return {};
}

/**
 * =============================================================================
 * FACE COMPARISON API CONFIGURATION
 * =============================================================================
 * Provide your existing endpoint details in `.env.local`.
 * This function is the single place those values are loaded.
 * =============================================================================
 */
export function getFaceComparisonConfig(): FaceComparisonConfig {
  const apiUrl = read("FACE_COMPARISON_API_URL");
  const format = read("FACE_COMPARISON_REQUEST_FORMAT", "json").toLowerCase();
  const mockFlag = read("FACE_COMPARISON_USE_MOCK", apiUrl ? "false" : "true");

  return {
    useMock: mockFlag.toLowerCase() === "true",
    mockMatch: read("FACE_COMPARISON_MOCK_MATCH", "true").toLowerCase() !== "false",
    apiUrl,
    apiKey: read("FACE_COMPARISON_API_KEY"),
    apiKeyHeader: read("FACE_COMPARISON_API_KEY_HEADER", "Authorization"),
    apiKeyPrefix: read("FACE_COMPARISON_API_KEY_PREFIX", "Bearer "),
    requestFormat: (format === "multipart" ? "multipart" : "json") as RequestFormat,
    capturedImageField: read(
      "FACE_COMPARISON_CAPTURED_IMAGE_FIELD",
      "capturedImage",
    ),
    referenceImageField: read(
      "FACE_COMPARISON_REFERENCE_IMAGE_FIELD",
      "referenceImage",
    ),
    extraJson: parseExtraJson(read("FACE_COMPARISON_EXTRA_JSON")),
    referenceImagePath: read(
      "FACE_COMPARISON_REFERENCE_IMAGE_PATH",
      "public/demo/reference-face.jpg",
    ),
    referenceImageUrl: read("FACE_COMPARISON_REFERENCE_IMAGE_URL"),
    sendReferenceAsUrl:
      read("FACE_COMPARISON_SEND_REFERENCE_AS_URL", "false").toLowerCase() ===
      "true",
    responseScorePath: read("FACE_COMPARISON_RESPONSE_SCORE_PATH", "score"),
    responseMatchPath: read("FACE_COMPARISON_RESPONSE_MATCH_PATH", "match"),
    matchThreshold: Number(read("FACE_COMPARISON_MATCH_THRESHOLD", "0.7")) || 0.7,
  };
}
