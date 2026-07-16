"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SettingsClient({
  userEmail,
  profileName,
  monthlyTakeHome,
  hasFinancialProfile,
}: {
  userEmail: string;
  profileName: string;
  monthlyTakeHome: number | null;
  hasFinancialProfile: boolean;
}) {
  const router = useRouter();
  const [confirmText, setConfirmText] = useState("");
  const [busy, setBusy] = useState<"profile" | "expenses" | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function clearFinancialProfile() {
    if (confirmText !== "Delete") {
      setError("Type Delete to confirm.");
      return;
    }

    setBusy("profile");
    setError(null);
    setMessage(null);

    const res = await fetch("/api/clear-financial-profile", { method: "DELETE" });
    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      setBusy(null);
      setError(data.error ?? "Failed to clear financial profile.");
      return;
    }

    setConfirmText("");
    setBusy(null);
    setMessage("Financial profile cleared.");
    router.refresh();
  }

  async function clearRecurringExpenses() {
    if (confirmText !== "Delete") {
      setError("Type Delete to confirm.");
      return;
    }

    setBusy("expenses");
    setError(null);
    setMessage(null);

    const res = await fetch("/api/clear-recurring-expenses", { method: "DELETE" });
    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      setBusy(null);
      setError(data.error ?? "Failed to clear recurring expenses.");
      return;
    }

    setConfirmText("");
    setBusy(null);
    setMessage("Recurring expenses cleared.");
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black p-8">
      <div className="mx-auto max-w-3xl space-y-8 rounded bg-white p-8 shadow dark:bg-zinc-900">
        {message ? (
          <p className="rounded border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm text-emerald-700">
            {message}
          </p>
        ) : null}
        {error ? (
          <p className="rounded border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
            {error}
          </p>
        ) : null}

        <section>
          <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
            Profile
          </h2>
          <p className="mb-2">Name: {profileName}</p>
          <p className="mb-2">Email: {userEmail}</p>
          <p className="mb-4">
            Estimated monthly take-home: {monthlyTakeHome ? `£${monthlyTakeHome}` : "Not set up"}
          </p>
          {!monthlyTakeHome && (
            <a href="/setup" className="text-blue-600 hover:underline">
              Set up take-home salary
            </a>
          )}
        </section>

        <section>
          <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
            Settings
          </h2>
          <div className="space-y-4 rounded border border-slate-200 p-4">
            <div>
              <h3 className="font-semibold text-slate-900">Clear financial profile</h3>
              <p className="mt-1 text-sm text-slate-600">
                This removes the saved financial profile data for your account.
              </p>
              <input
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder="Type Delete"
                className="mt-3 w-full rounded border border-slate-300 px-3 py-2 text-sm"
              />
              <button
                type="button"
                onClick={clearFinancialProfile}
                disabled={busy === "profile" || !hasFinancialProfile}
                className="mt-3 rounded bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {busy === "profile" ? "Clearing…" : "Clear financial profile"}
              </button>
            </div>

            <div>
              <h3 className="font-semibold text-slate-900">Clear recurring expenses</h3>
              <p className="mt-1 text-sm text-slate-600">
                This deletes all recurring expenses for your account.
              </p>
              <input
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder="Type Delete"
                className="mt-3 w-full rounded border border-slate-300 px-3 py-2 text-sm"
              />
              <button
                type="button"
                onClick={clearRecurringExpenses}
                disabled={busy === "expenses"}
                className="mt-3 rounded bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {busy === "expenses" ? "Clearing…" : "Clear recurring expenses"}
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
