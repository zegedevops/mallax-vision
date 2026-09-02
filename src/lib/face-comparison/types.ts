export type RequestFormat = "multipart" | "json";

/**
 * Environment-driven configuration for the existing face-comparison API.
 * Edit `.env.local` rather than changing application code when possible.
 */
export type FaceComparisonConfig = {
  useMock: boolean;
  mockMatch: boolean;
  apiUrl: string;
  apiKey: string;
  apiKeyHeader: string;
  apiKeyPrefix: string;
  requestFormat: RequestFormat;
  capturedImageField: string;
  referenceImageField: string;
  extraJson: Record<string, unknown>;
  referenceImagePath: string;
  referenceImageUrl: string;
  sendReferenceAsUrl: boolean;
  responseScorePath: string;
  responseMatchPath: string;
  matchThreshold: number;
};

export type FaceImagePayload = {
  bytes: Uint8Array;
  mimeType: string;
  filename: string;
};

export type CompareFacesInput = {
  captured: FaceImagePayload;
  reference: FaceImagePayload;
  referenceUrl?: string;
};

export type NormalizedFaceComparison = {
  match: boolean;
  score: number | null;
  threshold: number;
  provider: "mock" | "api";
  message: string;
  raw: unknown;
};
