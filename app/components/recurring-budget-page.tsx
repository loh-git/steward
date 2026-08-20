"use client";

import { useState } from "react";
import { formatGBP } from "@/utils/format/currency";
import { MONTH_NAMES, type MonthlyEntry } from "@/types/monthlyPlan";
import {
  SAVINGS_GOAL_NOTES_MAX_LENGTH,
  type InterestFrequency,
} from "@/types/savingsGoals";
import { TrashIcon, ChevronDownIcon } from "@/app/dashboard/components/icons";
import {
  projectSavingsGoalBalance,
} from "@/utils/savings/projectBalance";

// Preset "every N months" choices offered in the recurrence dropdown, plus
// the "custom" sentinel that reveals a free-entry number input for anything
// outside these. 1 (every month) is deliberately never offered — that's the
// implicit default when custom recurrence is off.
export const RECURRENCE_PRESETS = ["2", "3", "6", "12"] as const;

export type RecurringFormValues = {
  label: string;
  amount: string;
  usesVariableAmount?: boolean;
  currentBalance?: string;
  earnsInterest?: boolean;
  interestRate?: string;
  interestFrequency?: InterestFrequency;
  customRecurrence?: boolean;
  intervalMonths?: string;
  notes?: string;
  startsFromYear: string;
  startsFromMonth: string;
  endsUntilYear: string;
  endsUntilMonth: string;
};

export const emptyRecurringForm = (): RecurringFormValues => ({
  label: "",
  amount: "",
  usesVariableAmount: false,
  currentBalance: "",
  earnsInterest: false,
  interestRate: "",
  interestFrequency: "annually",
  customRecurrence: false,
  intervalMonths: "2",
  notes: "",
  startsFromYear: "",
  startsFromMonth: "",
  endsUntilYear: "",
  endsUntilMonth: "",
});

type RecurringItem = {
  id: string;
  label: string;
  amount: number | null;
  usesVariableAmount?: boolean;
  currentBalance?: number;
  earnsInterest?: boolean;
  interestRate?: number;
  interestFrequency?: InterestFrequency;
  intervalMonths?: number;
  notes?: string | null;
  startsFromYear: number | null;
  startsFromMonth: number | null;
  endsUntilYear: number | null;
  endsUntilMonth: number | null;
  createdAt: string;
};

function formatPeriod(
  year: number | null,
  month: number | null,
  fallback: string,
): string {
  if (year == null || month == null) return fallback;
  return `${MONTH_NAMES[month - 1]} ${year}`;
}

// A rate compounded monthly grows a balance faster than the same nominal
// annual rate compounded once a year — this projects 1 year ahead either way.
function projectedBalanceIn1Year(
  balance: number,
  annualRatePercent: number,
  frequency: InterestFrequency,
): number {
  const rate = annualRatePercent / 100;
  if (frequency === "monthly") {
    return balance * Math.pow(1 + rate / 12, 12);
  }
  return balance * (1 + rate);
}

export function RecurringBudgetPage({
  title,
  description,
  icon,
  accentClass,
  buttonClass,
  items,
  onAdd,
  onUpdate,
  onDelete,
  // Variable amount / current balance / earns interest are savings-goal concepts
  // (a goal has a running balance you're saving toward, a recurring expense doesn't).
  // Defaults to off so a new caller doesn't inherit savings-only fields by accident.
  showSavingsFields = false,
  monthlyEntries = [],
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  accentClass: string;
  buttonClass: string;
  items: RecurringItem[];
  onAdd: (values: RecurringFormValues) => Promise<void>;
  onUpdate: (id: string, values: RecurringFormValues) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  showSavingsFields?: boolean;
  monthlyEntries?: MonthlyEntry[];
}) {
  const [form, setForm] = useState<RecurringFormValues>(emptyRecurringForm());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedProjections, setExpandedProjections] = useState<Set<string>>(
    new Set(),
  );

  const toggleProjection = (id: string) =>
    setExpandedProjections((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });

  const now = new Date();
  const startYear = now.getFullYear();
  const startMonth = now.getMonth() + 1;

  const startEdit = (item: RecurringItem) => {
    setEditingId(item.id);
    setForm({
      label: item.label,
      amount: item.amount != null ? String(item.amount) : "",
      usesVariableAmount: item.usesVariableAmount ?? false,
      currentBalance:
        item.currentBalance != null ? String(item.currentBalance) : "",
      earnsInterest: item.earnsInterest ?? false,
      interestRate: item.interestRate != null ? String(item.interestRate) : "",
      interestFrequency: item.interestFrequency ?? "annually",
      customRecurrence: (item.intervalMonths ?? 1) > 1,
      intervalMonths:
        item.intervalMonths != null && item.intervalMonths > 1
          ? String(item.intervalMonths)
          : "2",
      notes: item.notes ?? "",
      // Previously defaulted to today's date on every edit, silently
      // overwriting the item's real start date on save even if the user
      // only meant to fix a typo in the label. Show what's actually stored,
      // same as endsUntilYear/endsUntilMonth below.
      startsFromYear:
        item.startsFromYear != null ? String(item.startsFromYear) : "",
      startsFromMonth:
        item.startsFromMonth != null ? String(item.startsFromMonth) : "",
      endsUntilYear:
        item.endsUntilYear != null ? String(item.endsUntilYear) : "",
      endsUntilMonth:
        item.endsUntilMonth != null ? String(item.endsUntilMonth) : "",
    });
  };

  const resetForm = () => {
    setEditingId(null);
    setForm(emptyRecurringForm());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.label || (!form.usesVariableAmount && !form.amount)) return;
    setSubmitting(true);
    setError(null);
    try {
      if (editingId) {
        await onUpdate(editingId, form);
      } else {
        await onAdd(form);
      }
      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-paper-canvas px-4 py-8 sm:px-8">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8 flex items-start gap-3">
          <span
            className={`flex h-11 w-11 items-center justify-center rounded-md ${accentClass}`}
          >
            {icon}
          </span>
          <div>
            <h1 className="font-display text-3xl font-bold text-ink-900">{title}</h1>
            <p className="mt-1 text-sm text-ink-500">{description}</p>
          </div>
        </div>

        {error ? (
          <p className="mb-4 rounded-md border border-ledger-200 bg-ledger-50 px-4 py-2 text-sm text-ledger-700">
            {error}
          </p>
        ) : null}

        <div className="mb-8 rounded-lg border border-ink-200 bg-paper-card p-6 shadow-sm">
          <h2 className="mb-4 font-display text-lg font-semibold text-ink-900">
            {editingId ? "Edit entry" : "Add entry"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <label className="block sm:col-span-2">
                <span className="mb-1 block text-sm font-medium text-ink-700">
                  Description
                </span>
                <input
                  value={form.label}
                  onChange={(e) => setForm({ ...form, label: e.target.value })}
                  placeholder="e.g. Rent, Groceries"
                  className="w-full rounded border border-ink-200 px-3 py-2 text-sm"
                  required
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-sm font-medium text-ink-700">
                  Amount (£ / month)
                </span>
                <input
                  type="number"
                  min={0}
                  step={0.01}
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  className="w-full rounded border border-ink-200 px-3 py-2 text-sm"
                  required={!form.usesVariableAmount}
                  disabled={form.usesVariableAmount}
                />
              </label>
              {!showSavingsFields ? (
                <>
                  <label className="flex items-center gap-2 rounded border border-ink-200 px-3 py-2 text-sm text-ink-700 sm:col-span-2">
                    <input
                      type="checkbox"
                      checked={form.customRecurrence ?? false}
                      onChange={(e) =>
                        setForm({ ...form, customRecurrence: e.target.checked })
                      }
                    />
                    Custom recurrence (not every month)
                  </label>
                  {form.customRecurrence ? (
                    <>
                      <label className="block">
                        <span className="mb-1 block text-sm font-medium text-ink-700">
                          Recurs
                        </span>
                        <select
                          value={
                            RECURRENCE_PRESETS.includes(
                              (form.intervalMonths ?? "") as (typeof RECURRENCE_PRESETS)[number],
                            )
                              ? form.intervalMonths
                              : "custom"
                          }
                          onChange={(e) => {
                            const value = e.target.value;
                            setForm({
                              ...form,
                              intervalMonths: value === "custom" ? "" : value,
                            });
                          }}
                          className="w-full rounded border border-ink-200 px-3 py-2 text-sm"
                        >
                          <option value="2">Every 2 months</option>
                          <option value="3">Quarterly (every 3 months)</option>
                          <option value="6">Every 6 months</option>
                          <option value="12">Annually</option>
                          <option value="custom">Other…</option>
                        </select>
                      </label>
                      {!RECURRENCE_PRESETS.includes(
                        (form.intervalMonths ?? "") as (typeof RECURRENCE_PRESETS)[number],
                      ) ? (
                        <label className="block">
                          <span className="mb-1 block text-sm font-medium text-ink-700">
                            Every how many months?
                          </span>
                          <input
                            type="number"
                            min={2}
                            step={1}
                            value={form.intervalMonths ?? ""}
                            onChange={(e) =>
                              setForm({ ...form, intervalMonths: e.target.value })
                            }
                            className="w-full rounded border border-ink-200 px-3 py-2 text-sm"
                          />
                        </label>
                      ) : null}
                    </>
                  ) : null}
                </>
              ) : null}
              {showSavingsFields ? (
                <>
                  <label className="flex items-center gap-2 rounded border border-ink-200 px-3 py-2 text-sm text-ink-700 sm:col-span-2">
                    <input
                      type="checkbox"
                      checked={form.usesVariableAmount ?? false}
                      onChange={(e) => {
                        const usesVariableAmount = e.target.checked;
                        setForm({
                          ...form,
                          usesVariableAmount,
                          amount: usesVariableAmount ? "" : form.amount,
                        });
                      }}
                    />
                    Amount varies by month and is chosen later
                  </label>
                  <label className="block">
                    <span className="mb-1 block text-sm font-medium text-ink-700">
                      Already saved (£)
                    </span>
                    <input
                      type="number"
                      min={0}
                      step={0.01}
                      value={form.currentBalance ?? ""}
                      onChange={(e) =>
                        setForm({ ...form, currentBalance: e.target.value })
                      }
                      className="w-full rounded border border-ink-200 px-3 py-2 text-sm"
                    />
                  </label>
                  <label className="flex items-center gap-2 rounded border border-ink-200 px-3 py-2 text-sm text-ink-700 sm:col-span-2">
                    <input
                      type="checkbox"
                      checked={form.earnsInterest ?? false}
                      onChange={(e) =>
                        setForm({ ...form, earnsInterest: e.target.checked })
                      }
                    />
                    This balance earns interest
                  </label>
                  {form.earnsInterest ? (
                    <>
                      <label className="block">
                        <span className="mb-1 block text-sm font-medium text-ink-700">
                          Interest rate (% annual)
                        </span>
                        <input
                          type="number"
                          min={0}
                          step={0.01}
                          value={form.interestRate ?? ""}
                          onChange={(e) =>
                            setForm({ ...form, interestRate: e.target.value })
                          }
                          className="w-full rounded border border-ink-200 px-3 py-2 text-sm"
                        />
                      </label>
                      <label className="block">
                        <span className="mb-1 block text-sm font-medium text-ink-700">
                          Interest paid
                        </span>
                        <select
                          value={form.interestFrequency ?? "annually"}
                          onChange={(e) =>
                            setForm({
                              ...form,
                              interestFrequency: e.target.value as InterestFrequency,
                            })
                          }
                          className="w-full rounded border border-ink-200 px-3 py-2 text-sm"
                        >
                          <option value="annually">Annually</option>
                          <option value="monthly">Monthly</option>
                        </select>
                      </label>
                    </>
                  ) : null}
                  <label className="block sm:col-span-2">
                    <span className="mb-1 flex items-center justify-between text-sm font-medium text-ink-700">
                      <span>Notes (optional)</span>
                      <span className="text-xs font-normal text-ink-400">
                        {(form.notes ?? "").length}/{SAVINGS_GOAL_NOTES_MAX_LENGTH}
                      </span>
                    </span>
                    <textarea
                      value={form.notes ?? ""}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          notes: e.target.value.slice(0, SAVINGS_GOAL_NOTES_MAX_LENGTH),
                        })
                      }
                      maxLength={SAVINGS_GOAL_NOTES_MAX_LENGTH}
                      rows={3}
                      placeholder="Anything worth remembering about this goal"
                      className="w-full rounded border border-ink-200 px-3 py-2 text-sm"
                    />
                  </label>
                </>
              ) : null}
            </div>

            <fieldset className="rounded-md border border-ink-100 p-4">
              <legend className="px-1 text-sm font-medium text-ink-700">
                Starts from (optional)
              </legend>
              <p className="mb-3 text-xs text-ink-500">
                Leave blank and this change will apply from the current month
                when saved.
              </p>
              <div className="grid grid-cols-2 gap-3">
                <select
                  value={form.startsFromMonth}
                  onChange={(e) =>
                    setForm({ ...form, startsFromMonth: e.target.value })
                  }
                  className="rounded border border-ink-200 px-3 py-2 text-sm"
                >
                  <option value="">Month</option>
                  {MONTH_NAMES.map((name, i) => (
                    <option key={name} value={i + 1}>
                      {name}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  placeholder="Year"
                  value={form.startsFromYear}
                  onChange={(e) =>
                    setForm({ ...form, startsFromYear: e.target.value })
                  }
                  className="rounded border border-ink-200 px-3 py-2 text-sm"
                />
              </div>
            </fieldset>

            <fieldset className="rounded-md border border-ink-100 p-4">
              <legend className="px-1 text-sm font-medium text-ink-700">
                Recurs until (optional)
              </legend>
              <div className="grid grid-cols-2 gap-3">
                <select
                  value={form.endsUntilMonth}
                  onChange={(e) =>
                    setForm({ ...form, endsUntilMonth: e.target.value })
                  }
                  className="rounded border border-ink-200 px-3 py-2 text-sm"
                >
                  <option value="">Month</option>
                  {MONTH_NAMES.map((name, i) => (
                    <option key={name} value={i + 1}>
                      {name}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  placeholder="Year"
                  value={form.endsUntilYear}
                  onChange={(e) =>
                    setForm({ ...form, endsUntilYear: e.target.value })
                  }
                  className="rounded border border-ink-200 px-3 py-2 text-sm"
                />
              </div>
            </fieldset>

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={submitting}
                className={`rounded px-4 py-2 text-sm font-medium text-white disabled:opacity-60 ${buttonClass}`}
              >
                {submitting ? "Saving…" : editingId ? "Update" : "Add"}
              </button>
              {editingId ? (
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded border border-ink-200 px-4 py-2 text-sm text-ink-600 hover:bg-ink-50"
                >
                  Cancel
                </button>
              ) : null}
            </div>
          </form>
        </div>

        <div className="rounded-lg border border-ink-200 bg-paper-card shadow-sm">
          <h2 className="border-b border-ink-100 px-6 py-4 font-display text-lg font-semibold text-ink-900">
            Your entries ({items.length})
          </h2>
          {items.length === 0 ? (
            <p className="px-6 py-8 text-sm text-ink-500">
              No entries yet. Add your first one above — they will appear in
              each month&apos;s planner automatically.
            </p>
          ) : (
            <ul className="divide-y divide-ink-100">
              {items.map((item) => (
                <li
                  key={item.id}
                  className="flex flex-wrap items-center justify-between gap-3 px-6 py-4"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium text-ink-900">
                      {item.label}
                    </p>
                    <p className="text-xs text-ink-500">
                      From{" "}
                      {formatPeriod(
                        item.startsFromYear,
                        item.startsFromMonth,
                        "when added",
                      )}
                      {" · "}
                      Until{" "}
                      {formatPeriod(
                        item.endsUntilYear,
                        item.endsUntilMonth,
                        "ongoing",
                      )}
                      {item.intervalMonths && item.intervalMonths > 1
                        ? ` · Every ${item.intervalMonths} months`
                        : ""}
                    </p>
                    {item.notes ? (
                      <p className="mt-1 whitespace-pre-wrap text-xs text-ink-500">
                        {item.notes}
                      </p>
                    ) : null}
                    {item.earnsInterest && (item.currentBalance ?? 0) > 0 ? (
                      <p className="mt-1 text-xs text-brass-700">
                        {formatGBP(item.currentBalance ?? 0)} now → ~
                        {formatGBP(
                          projectedBalanceIn1Year(
                            item.currentBalance ?? 0,
                            item.interestRate ?? 0,
                            item.interestFrequency ?? "annually",
                          ),
                        )}{" "}
                        in 1 year ({item.interestRate}% compounded{" "}
                        {item.interestFrequency === "monthly"
                          ? "monthly"
                          : "annually"}
                        )
                      </p>
                    ) : null}
                    {showSavingsFields ? (
                      <div className="mt-2">
                        <button
                          type="button"
                          onClick={() => toggleProjection(item.id)}
                          aria-expanded={expandedProjections.has(item.id)}
                          className="flex items-center gap-1.5 text-[11px] font-semibold tracking-wide text-ledger-600 hover:text-ledger-700"
                        >
                          {expandedProjections.has(item.id)
                            ? "Hide monthly projection"
                            : "Show monthly projection"}
                          <ChevronDownIcon
                            className={`h-3 w-3 transition-transform ${
                              expandedProjections.has(item.id) ? "rotate-180" : ""
                            }`}
                          />
                        </button>

                        {expandedProjections.has(item.id) ? (
                          <div className="mt-2 max-h-64 overflow-y-auto rounded border border-ink-100">
                            <table className="w-full text-xs">
                              <thead className="sticky top-0 bg-paper-card">
                                <tr className="text-left text-ink-500">
                                  <th className="px-3 py-1.5 font-medium">Month</th>
                                  <th className="px-3 py-1.5 font-medium">
                                    Contribution
                                  </th>
                                  <th className="px-3 py-1.5 font-medium">Balance</th>
                                </tr>
                              </thead>
                              <tbody>
                                {projectSavingsGoalBalance(
                                  item,
                                  monthlyEntries,
                                  startYear,
                                  startMonth,
                                ).map((p) => (
                                  <tr
                                    key={`${p.year}-${p.month}`}
                                    className="border-t border-ink-50"
                                  >
                                    <td className="px-3 py-1.5 text-ink-700">
                                      {MONTH_NAMES[p.month - 1]} {p.year}
                                    </td>
                                    <td className="px-3 py-1.5 text-ink-700">
                                      {formatGBP(p.contribution)}
                                    </td>
                                    <td className="px-3 py-1.5 font-medium text-ink-900">
                                      {formatGBP(p.balance)}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        ) : null}
                      </div>
                    ) : null}
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <span className="font-semibold text-ink-800">
                      {item.usesVariableAmount
                        ? "Varies by month"
                        : `${formatGBP(item.amount ?? 0)}/mo`}
                    </span>
                    <button
                      type="button"
                      onClick={() => startEdit(item)}
                      className="text-sm text-ledger-600 hover:underline"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        // Deleting is permanent and immediate — a bare click
                        // was one accidental tap away from silent data loss.
                        if (window.confirm(`Delete "${item.label}"? This can't be undone.`)) {
                          onDelete(item.id);
                        }
                      }}
                      className="text-ink-300 hover:text-ledger-500"
                      aria-label={`Delete ${item.label}`}
                    >
                      <TrashIcon />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

export function parseRecurringPayload(values: RecurringFormValues) {
  const today = new Date();
  const defaultYear = today.getFullYear();
  const defaultMonth = today.getMonth() + 1;

  return {
    label: values.label,
    amount: values.usesVariableAmount ? null : Number(values.amount),
    usesVariableAmount: values.usesVariableAmount ?? false,
    currentBalance: values.currentBalance ? Number(values.currentBalance) : 0,
    earnsInterest: values.earnsInterest ?? false,
    interestRate: values.interestRate ? Number(values.interestRate) : 0,
    interestFrequency: values.interestFrequency ?? "annually",
    intervalMonths:
      values.customRecurrence && values.intervalMonths
        ? Math.max(2, Number(values.intervalMonths))
        : 1,
    notes: values.notes?.trim()
      ? values.notes.trim().slice(0, SAVINGS_GOAL_NOTES_MAX_LENGTH)
      : null,
    startsFromYear: values.startsFromYear
      ? Number(values.startsFromYear)
      : defaultYear,
    startsFromMonth: values.startsFromMonth
      ? Number(values.startsFromMonth)
      : defaultMonth,
    endsUntilYear: values.endsUntilYear ? Number(values.endsUntilYear) : null,
    endsUntilMonth: values.endsUntilMonth
      ? Number(values.endsUntilMonth)
      : null,
  };
}
