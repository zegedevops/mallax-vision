import type { FaceComparisonConfig, NormalizedFaceComparison } from "@/lib/face-comparison/types";

export async function mockCompareFaces(
  config: FaceComparisonConfig,
): Promise<NormalizedFaceComparison> {
  await new Promise((resolve) => setTimeout(resolve, 900));

  const score = config.mockMatch ? 0.93 : 0.41;

  return {
    match: config.mockMatch,
    score,
    threshold: config.matchThreshold,
    provider: "mock",
    message: config.mockMatch
      ? "Mock provider returned a successful match. Connect your API in .env.local to replace this."
      : "Mock provider returned a failed match. Set FACE_COMPARISON_MOCK_MATCH=true to simulate success.",
    raw: {
      provider: "mock",
      match: config.mockMatch,
      score,
      threshold: config.matchThreshold,
      note: "No external face-comparison call was made.",
    },
  };
}
