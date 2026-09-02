import Link from "next/link";
import { BrandMark } from "@/components/BrandMark";
import { PrivacyNotice } from "@/components/PrivacyNotice";
import { RegisterForm } from "@/components/RegisterForm";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";

export default async function RegisterPage() {
  const session = await getSession();
  if (session?.faceVerified) redirect("/dashboard");
  if (session) redirect("/verify");

  return (
    <main className="min-h-full lg:grid lg:grid-cols-2">
      <section className="relative hidden overflow-hidden bg-[#0b1f1c] px-10 py-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(45,212,191,0.18),transparent_42%),radial-gradient(circle_at_80%_80%,rgba(13,148,136,0.22),transparent_40%)]" />
        <div className="relative">
          <BrandMark />
        </div>
        <div className="relative max-w-md space-y-5">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-teal-200/80">
            Enroll a merchant
          </p>
          <h1 className="text-4xl font-semibold tracking-tight">
            Register with email, password, and a reference photo.
          </h1>
          <p className="text-sm leading-6 text-teal-50/75">
            The photo is stored in the demo folder and compared against a webcam
            capture the next time this merchant signs in.
          </p>
        </div>
        <p className="relative text-xs text-teal-100/50">
          Portfolio demonstration. Enrolled photos stay on this machine.
        </p>
      </section>

      <section className="flex min-h-full flex-col justify-center px-5 py-10 sm:px-10">
        <div className="mx-auto w-full max-w-md animate-fade-up">
          <div className="mb-8 lg:hidden">
            <BrandMark />
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <h2 className="text-xl font-semibold tracking-tight text-slate-900">
              Create merchant account
            </h2>
            <p className="mt-1.5 text-sm text-slate-500">
              After registration you continue to face verification.
            </p>
            <div className="mt-6">
              <RegisterForm />
            </div>
            <p className="mt-5 text-center text-sm text-slate-600">
              Already have an account?{" "}
              <Link href="/" className="font-medium text-teal-800 hover:underline">
                Sign in
              </Link>
            </p>
          </div>
          <PrivacyNotice className="mt-5 max-w-md" />
        </div>
      </section>
    </main>
  );
}
