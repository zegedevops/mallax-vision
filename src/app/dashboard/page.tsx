import { BrandMark } from "@/components/BrandMark";
import { SignOutButton } from "@/components/SignOutButton";
import { DASHBOARD_STATS, RECENT_RETURNS } from "@/lib/merchants";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";

function formatVerifiedAt(value: string | null) {
  if (!value) return "Just now";
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect("/");
  if (!session.faceVerified) redirect("/verify");

  const initials = session.name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2);

  return (
    <main className="min-h-full">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <BrandMark compact />
          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-medium text-slate-900">{session.name}</p>
              <p className="text-xs text-slate-500">{session.storeName}</p>
            </div>
            <SignOutButton />
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl space-y-6 px-4 py-8 sm:px-6">
        <section className="animate-fade-up rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="grid h-14 w-14 place-items-center rounded-2xl bg-teal-800 text-lg font-semibold text-white">
                {initials}
              </div>
              <div>
                <h1 className="text-xl font-semibold tracking-tight text-slate-900">
                  {session.name}
                </h1>
                <p className="text-sm text-slate-500">
                  {session.role} · {session.storeDomain}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
                <p className="text-xs font-medium uppercase tracking-wide text-emerald-800">
                  Verification status
                </p>
                <p className="mt-1 text-sm font-semibold text-emerald-950">
                  Identity verified
                </p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Last verification
                </p>
                <p className="mt-1 text-sm font-semibold text-slate-900">
                  {formatVerifiedAt(session.verifiedAt)}
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {DASHBOARD_STATS.map((stat) => (
            <article
              key={stat.label}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <p className="text-sm text-slate-500">{stat.label}</p>
              <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">
                {stat.value}
              </p>
              <p className="mt-2 text-xs text-slate-500">{stat.hint}</p>
              <p className="mt-1 text-xs font-medium text-teal-800">{stat.change}</p>
            </article>
          ))}
        </section>

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-5 py-4 sm:px-6">
            <h2 className="font-semibold text-slate-900">Recent Shopify returns</h2>
            <p className="mt-1 text-sm text-slate-500">
              Mock return-verification activity for this demo store.
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-3 font-medium sm:px-6">Return</th>
                  <th className="px-5 py-3 font-medium sm:px-6">Order</th>
                  <th className="px-5 py-3 font-medium sm:px-6">Item</th>
                  <th className="px-5 py-3 font-medium sm:px-6">Status</th>
                  <th className="px-5 py-3 font-medium sm:px-6">Match score</th>
                </tr>
              </thead>
              <tbody>
                {RECENT_RETURNS.map((row) => (
                  <tr key={row.id} className="border-t border-slate-100">
                    <td className="px-5 py-3 font-medium text-slate-900 sm:px-6">
                      {row.id}
                    </td>
                    <td className="px-5 py-3 text-slate-600 sm:px-6">{row.order}</td>
                    <td className="px-5 py-3 text-slate-600 sm:px-6">{row.item}</td>
                    <td className="px-5 py-3 sm:px-6">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          row.status === "Verified"
                            ? "bg-emerald-50 text-emerald-800"
                            : "bg-amber-50 text-amber-900"
                        }`}
                      >
                        {row.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 font-mono text-slate-700 sm:px-6">
                      {row.score}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}
