"use client";

import { useEffect, useState } from "react";
import type { MonthlyEntry } from "@/types/monthlyPlan";
import { MONTH_NAMES } from "@/types/monthlyPlan";
import type { SavingsGoal } from "@/types/savingsGoals";
import type { RecurringExpense } from "@/types/recurringExpenses";
import { CloseIcon } from "./icons";
import MonthlyDetailView from "./MonthlyDetailView";

type MonthDetailModalProps = {
  open: boolean;
  year: number;
  month: number | null;
  resolveEntry: (year: number, month: number) => MonthlyEntry;
  baseNetMonthly: number;
  onClose: () => void;
  onSaveMonth: (entry: MonthlyEntry) => Promise<void>;
  savingsGoals: SavingsGoal[];
  recurringExpenses: RecurringExpense[];
  saveError?: string | null;
};

export default function MonthDetailModal({
  open,
  year,
  month,
  resolveEntry,
  baseNetMonthly,
  onClose,
  onSaveMonth,
  savingsGoals,
  recurringExpenses,
  saveError,
}: MonthDetailModalProps) {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(month ?? 1);

  useEffect(() => {
    if (month !== null) setSelectedMonth(month);
  }, [month]);

  useEffect(() => {
    if (open) {
      setMounted(true);
      document.body.style.overflow = "hidden";
      const frame = requestAnimationFrame(() => setVisible(true));
      return () => cancelAnimationFrame(frame);
    }

    setVisible(false);
    const timer = window.setTimeout(() => setMounted(false), 300);
    document.body.style.overflow = "";
    return () => window.clearTimeout(timer);
  }, [open]);

  useEffect(() => {
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mounted, onClose]);

  if (!mounted) return null;

  const monthLabel = MONTH_NAMES[selectedMonth - 1];

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center p-4 sm:items-center sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label={`${monthLabel} budget details`}
    >
      <div
        className={`absolute inset-0 bg-ink-900/40 backdrop-blur-sm transition-opacity duration-300 ${
          visible ? "opacity-100" : "opacity-0"
        }`}
        onClick={onClose}
      />

      <div
        className={`relative flex max-h-[92vh] w-full max-w-6xl flex-col overflow-hidden rounded-lg border border-ink-200 bg-paper-canvas shadow-2xl transition-all duration-300 ease-out ${
          visible
            ? "translate-y-0 scale-100 opacity-100"
            : "translate-y-4 scale-[0.98] opacity-0"
        }`}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-ink-200 bg-paper-card px-5 py-4">
          <div>
            <h2 className="font-display text-lg font-semibold text-ink-900">
              {monthLabel} {year}
            </h2>
            <p className="text-xs text-ink-500">Monthly budget breakdown</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-2 text-ink-500 transition hover:bg-ink-100 hover:text-ink-800"
            aria-label="Close"
          >
            <CloseIcon />
          </button>
        </div>

        <div className="overflow-y-auto p-4 sm:p-6">
          {saveError ? (
            <p className="mb-4 rounded-md border border-ledger-200 bg-ledger-50 px-4 py-2 text-sm text-ledger-700">
              {saveError}
            </p>
          ) : null}
          <MonthlyDetailView
            year={year}
            resolveEntry={resolveEntry}
            baseNetMonthly={baseNetMonthly}
            selectedMonth={selectedMonth}
            onMonthChange={setSelectedMonth}
            onSaveMonth={onSaveMonth}
            savingsGoals={savingsGoals}
            recurringExpenses={recurringExpenses}
            allowSavingsAdd
          />
        </div>
      </div>
    </div>
  );
}
