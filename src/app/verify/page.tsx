import { BrandMark } from "@/components/BrandMark";
import { FaceVerificationPanel } from "@/components/FaceVerificationPanel";
import { PrivacyNotice } from "@/components/PrivacyNotice";
import { SignOutButton } from "@/components/SignOutButton";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";

export default async function VerifyPage() {
  const session = await getSession();
  if (!session) redirect("/");

  return (
    <main className="min-h-full px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-3xl">
        <header className="mb-6 flex items-center justify-between gap-4">
          <BrandMark compact />
          <div className="flex items-center gap-3">
            <p className="hidden text-sm text-slate-500 sm:block">{session.email}</p>
            <SignOutButton />
          </div>
        </header>

        <div className="animate-fade-up rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-800">
            Step 2 of 2
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">
            Face verification
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            Allow camera access, center your face in the frame, then capture a
            photo. This demo compares it to the enrolled merchant reference image
            through your configured face-comparison API.
          </p>
          <div className="mt-5 flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={session.referenceImageUrl}
              alt=""
              className="h-12 w-12 rounded-full object-cover"
            />
            <div>
              <p className="text-sm font-medium text-slate-900">
                Enrolled photo · {session.name}
              </p>
              <p className="text-xs text-slate-500">
                Compared against the photo stored in public/demo for this account.
              </p>
            </div>
          </div>
          <div className="mt-6">
            <FaceVerificationPanel />
          </div>
        </div>
        <PrivacyNotice className="mt-5" />
      </div>
    </main>
  );
}
