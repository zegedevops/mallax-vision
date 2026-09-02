"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

type VerifyResponse = {
  ok?: boolean;
  match?: boolean;
  score?: number | null;
  threshold?: number;
  provider?: string;
  message?: string;
  raw?: unknown;
  error?: string;
};

type CameraState = "idle" | "requesting" | "live" | "denied" | "unavailable";

export function FaceVerificationPanel() {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [camera, setCamera] = useState<CameraState>("idle");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<VerifyResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  }, []);

  const startCamera = useCallback(async () => {
    setError(null);
    setResult(null);
    setCamera("requesting");

    if (!navigator.mediaDevices?.getUserMedia) {
      setCamera("unavailable");
      setError("This browser does not support camera access.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCamera("live");
    } catch (err) {
      const name = err instanceof DOMException ? err.name : "";
      if (name === "NotAllowedError" || name === "PermissionDeniedError") {
        setCamera("denied");
        setError("Camera permission was denied. Allow access and try again.");
        return;
      }
      setCamera("unavailable");
      setError("Unable to start the camera. Check that it is not in use by another app.");
    }
  }, []);

  useEffect(() => {
    void startCamera();
    return () => stopCamera();
  }, [startCamera, stopCamera]);

  async function captureAndVerify() {
    const video = videoRef.current;
    if (!video || camera !== "live") return;

    setBusy(true);
    setError(null);
    setResult(null);

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const context = canvas.getContext("2d");
    if (!context) {
      setBusy(false);
      setError("Could not capture a frame from the webcam.");
      return;
    }

    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", 0.88),
    );

    if (!blob) {
      setBusy(false);
      setError("Could not encode the captured image.");
      return;
    }

    const form = new FormData();
    form.append("image", blob, "capture.jpg");

    try {
      const response = await fetch("/api/verify-face", {
        method: "POST",
        body: form,
      });
      const data = (await response.json()) as VerifyResponse;

      if (!response.ok) {
        setError(data.error ?? "Verification request failed.");
        return;
      }

      setResult(data);
    } catch {
      setError("Network error while contacting the verification service.");
    } finally {
      setBusy(false);
    }
  }

  const matched = result?.match === true;
  const failed = result?.match === false;

  return (
    <div className="space-y-5">
      <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-950 shadow-sm">
        <video
          ref={videoRef}
          playsInline
          muted
          className={`aspect-[4/3] w-full object-cover ${camera === "live" ? "opacity-100" : "opacity-40"}`}
        />
        <div className="pointer-events-none absolute inset-0 grid place-items-center">
          <div className="relative h-[58%] w-[46%] rounded-[46%] border-2 border-white/70 shadow-[0_0_0_999px_rgba(15,23,42,0.28)]">
            {camera === "live" && !busy && (
              <span className="pulse-ring absolute inset-0 rounded-[46%] border border-teal-300/80" />
            )}
          </div>
        </div>
        {busy && (
          <div className="absolute inset-0 grid place-items-center bg-slate-950/55 text-sm font-medium text-white">
            Comparing faces…
          </div>
        )}
        {camera !== "live" && !busy && (
          <div className="absolute inset-0 grid place-items-center px-6 text-center text-sm text-slate-200">
            {camera === "requesting" && "Requesting camera access…"}
            {camera === "denied" && "Camera blocked. Update browser permissions to continue."}
            {camera === "unavailable" && "Camera is not available on this device."}
            {camera === "idle" && "Starting camera…"}
          </div>
        )}
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </div>
      )}

      {matched && (
        <div className="animate-fade-up rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
          <p className="text-sm font-semibold text-emerald-900">Identity verified</p>
          <p className="mt-1 text-sm text-emerald-800">
            {result?.message}
            {typeof result?.score === "number" && (
              <> Score {result.score.toFixed(2)} (threshold {result.threshold}).</>
            )}
          </p>
        </div>
      )}

      {failed && (
        <div className="animate-fade-up rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
          <p className="text-sm font-semibold text-amber-950">Verification failed</p>
          <p className="mt-1 text-sm text-amber-900">
            {result?.message ?? "The captured face did not match the enrolled merchant photo."}
            {typeof result?.score === "number" && (
              <> Score {result.score.toFixed(2)} (threshold {result.threshold}).</>
            )}
          </p>
        </div>
      )}

      {result?.raw !== undefined && (
        <details className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
          <summary className="cursor-pointer text-sm font-medium text-slate-700">
            API response
          </summary>
          <pre className="mt-3 overflow-x-auto text-xs leading-5 text-slate-600">
            {JSON.stringify(
              {
                match: result.match,
                score: result.score,
                threshold: result.threshold,
                provider: result.provider,
                raw: result.raw,
              },
              null,
              2,
            )}
          </pre>
        </details>
      )}

      <div className="flex flex-col gap-2 sm:flex-row">
        {!matched && (
          <button
            type="button"
            disabled={busy || camera !== "live"}
            onClick={() => void captureAndVerify()}
            className="flex-1 rounded-xl bg-teal-800 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-900 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {busy ? "Verifying…" : failed ? "Try again" : "Capture and verify"}
          </button>
        )}
        {matched && (
          <button
            type="button"
            onClick={() => {
              stopCamera();
              router.push("/dashboard");
              router.refresh();
            }}
            className="flex-1 rounded-xl bg-teal-800 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-teal-900"
          >
            Open merchant dashboard
          </button>
        )}
        {camera !== "live" && (
          <button
            type="button"
            onClick={() => void startCamera()}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-50"
          >
            Allow camera
          </button>
        )}
      </div>
    </div>
  );
}
