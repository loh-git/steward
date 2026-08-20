"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { logSalaryChange } from "./actions";
import type { SalaryChange } from "@/types/salaryHistory";
import { formatGBP } from "@/utils/format/currency";

const MONTH_NAMES_SHORT = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

function formatWindowLabel(change: SalaryChange): string {
  const startLabel =
    change.effectiveFromYear != null && change.effectiveFromMonth != null
      ? `${MONTH_NAMES_SHORT[change.effectiveFromMonth - 1]} ${change.effectiveFromYear}`
      : "—";
  const endLabel = `${MONTH_NAMES_SHORT[change.endsUntilMonth - 1]} ${change.endsUntilYear}`;
  return `${startLabel} – ${endLabel}`;
}

export default function SalaryHistorySection({
  salaryChanges,
}: {
  salaryChanges: SalaryChange[];
}) {
  const router = useRouter();
  const [annualIncome, setAnnualIncome] = useState("");
  const [effectiveMonth, setEffectiveMonth] = useState(() =>
    new Date().toISOString().slice(0, 7),
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const amount = Number(annualIncome);
    if (!Number.isFinite(amount) || amount <= 0) {
      setError("Enter a valid annual salary.");
      return;
    }
    const [yearStr, monthStr] = effectiveMonth.split("-");

    setBusy(true);
    setError(null);
    setMessage(null);
    try {
      await logSalaryChange({
        annualIncome: amount,
        effectiveYear: Number(yearStr),
        effectiveMonth: Number(monthStr),
      });
      setAnnualIncome("");
      setMessage("Pay rise logged.");
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to log salary change.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="border-t border-ink-200 pt-6">
      <h2 className="mb-1 font-display text-2xl font-bold text-ink-900">
        Salary History
      </h2>
      <p className="mb-4 text-sm text-ink-600">
        Log a pay rise from a specific month, and past months on your
        dashboard will keep using the salary that actually applied then. Need
        to change your tax code or pension too? Use the full{" "}
        <a href="/setup" className="text-ledger-600 hover:underline">
          Setup form
        </a>{" "}
        instead.
      </p>

      {message ? (
        <p className="mb-4 rounded-md border border-bottle-200 bg-bottle-50 px-4 py-2 text-sm text-bottle-700">
          {message}
        </p>
      ) : null}
      {error ? (
        <p className="mb-4 rounded-md border border-ledger-200 bg-ledger-50 px-4 py-2 text-sm text-ledger-700">
          {error}
        </p>
      ) : null}

      {salaryChanges.length > 0 ? (
        <ul className="mb-6 space-y-2 text-sm">
          {salaryChanges.map((change) => (
            <li
              key={change.id}
              className="flex items-center justify-between rounded-md border border-ink-200 px-3 py-2"
            >
              <span className="text-ink-600">{formatWindowLabel(change)}</span>
              <span className="font-medium text-ink-900">
                {formatGBP(change.annualIncome, 0)} / year · {change.taxCode}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mb-6 text-sm text-ink-500">
          No past changes logged yet.
        </p>
      )}

      <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-3">
        <div>
          <label
            className="mb-1 block text-sm font-medium text-ink-800"
            htmlFor="new-annual-income"
          >
            New annual salary (£)
          </label>
          <input
            id="new-annual-income"
            type="number"
            min={0}
            step={0.01}
            value={annualIncome}
            onChange={(e) => setAnnualIncome(e.target.value)}
            className="w-40 rounded border border-ink-200 bg-paper-card p-2"
          />
        </div>
        <div>
          <label
            className="mb-1 block text-sm font-medium text-ink-800"
            htmlFor="effective-month"
          >
            Effective from
          </label>
          <input
            id="effective-month"
            type="month"
            value={effectiveMonth}
            onChange={(e) => setEffectiveMonth(e.target.value)}
            className="rounded border border-ink-200 bg-paper-card p-2"
          />
        </div>
        <button
          type="submit"
          disabled={busy}
          className="rounded bg-ledger-600 px-4 py-2 text-sm font-medium text-white hover:bg-ledger-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {busy ? "Logging…" : "Log pay rise"}
        </button>
      </form>
    </section>
  );
}
