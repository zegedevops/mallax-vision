"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

const ACCEPT = "image/jpeg,image/png,image/webp";

export function RegisterForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [imageName, setImageName] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  function onImageChange(file: File | undefined) {
    if (preview) URL.revokeObjectURL(preview);
    if (!file) {
      setImageName(null);
      setPreview(null);
      return;
    }
    setImageName(file.name);
    setPreview(URL.createObjectURL(file));
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    const form = event.currentTarget;
    const data = new FormData(form);
    setPending(true);

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        body: data,
      });
      const payload = (await response.json()) as { error?: string; next?: string };

      if (!response.ok) {
        setError(payload.error ?? "Unable to create the account.");
        return;
      }

      router.push(payload.next ?? "/verify");
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <label htmlFor="name" className="text-sm font-medium text-slate-700">
          Full name
        </label>
        <input
          id="name"
          name="name"
          type="text"
          autoComplete="name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-sm outline-none ring-teal-700/20 transition focus:border-teal-700 focus:ring-4"
          placeholder="Jordan Hale"
        />
      </div>
      <div className="space-y-1.5">
        <label htmlFor="email" className="text-sm font-medium text-slate-700">
          Merchant email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="username"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-sm outline-none ring-teal-700/20 transition focus:border-teal-700 focus:ring-4"
          placeholder="you@store.com"
        />
      </div>
      <div className="space-y-1.5">
        <label htmlFor="password" className="text-sm font-medium text-slate-700">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-sm outline-none ring-teal-700/20 transition focus:border-teal-700 focus:ring-4"
          placeholder="At least 8 characters"
        />
      </div>
      <div className="space-y-1.5">
        <label htmlFor="confirmPassword" className="text-sm font-medium text-slate-700">
          Confirm password
        </label>
        <input
          id="confirmPassword"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-sm outline-none ring-teal-700/20 transition focus:border-teal-700 focus:ring-4"
          placeholder="Repeat password"
        />
      </div>
      <div className="space-y-1.5">
        <label htmlFor="referenceImage" className="text-sm font-medium text-slate-700">
          Reference face photo
        </label>
        <input
          id="referenceImage"
          name="referenceImage"
          type="file"
          accept={ACCEPT}
          required
          onChange={(event) => onImageChange(event.target.files?.[0])}
          className="block w-full text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-teal-800 file:px-3 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-teal-900"
        />
        <p className="text-xs text-slate-500">
          Saved to <span className="font-mono">public/demo</span> and used as your
          enrolled photo at verification.
        </p>
        {preview && (
          <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={preview}
              alt=""
              className="h-12 w-12 rounded-full object-cover"
            />
            <p className="truncate text-xs text-slate-600">{imageName}</p>
          </div>
        )}
      </div>

      {error && (
        <p
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800"
        >
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="flex w-full items-center justify-center rounded-xl bg-teal-800 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-900 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? "Creating account…" : "Create account"}
      </button>
    </form>
  );
}
