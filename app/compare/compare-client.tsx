"use client";

import { useMemo, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleLeft, faAngleRight } from "@fortawesome/free-solid-svg-icons";
import { mergeMonthlyEntry } from "@/utils/monthly/merge-recurring";
import { emptyMonthlyEntry, MONTH_NAMES } from "@/types/monthlyPlan";
import type { MonthlyEntry } from "@/types/monthlyPlan";
import type { SavingsGoal } from "@/types/savingsGoals";
import type { RecurringExpense } from "@/types/recurringExpenses";
import { formatGBP } from "@/utils/format/currency";
import { GridViewIcon } from "@/app/dashboard/components/icons";

type CompareRow = {
  id: string;
  label: string;
  values: (number | undefined)[];
};

export default function CompareClient({
  initialMonthsData,
  recurringExpenses,
  savingsGoals,
  initialYear,
}: {
  initialMonthsData: MonthlyEntry[];
  recurringExpenses: RecurringExpense[];
  savingsGoals: SavingsGoal[];
  initialYear: number;
}) {
  const [year, setYear] = useState(initialYear);
  const currentYear = new Date().getFullYear();
  const currentMonthIndex =
    year === currentYear ? new Date().getMonth() : -1;

  // Re-merge each month of the selected year fresh, the same way the
  // dashboard/planner do — so an item's default amount and any per-month
  // override both show up exactly as they would there.
  const months = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => {
      const m = i + 1;
      const stored =
        initialMonthsData.find((e) => e.year === year && e.month === m) ??
        emptyMonthlyEntry(year, m);
      return mergeMonthlyEntry(stored, recurringExpenses, savingsGoals);
    });
  }, [initialMonthsData, recurringExpenses, savingsGoals, year]);

  const expenseRows: CompareRow[] = useMemo(
    () =>
      recurringExpenses.map((r) => ({
        id: r.id,
        label: r.label,
        values: months.map(
          (m) => m.expenditures.find((e) => e.recurringExpenseId === r.id)?.amount,
        ),
      })),
    [recurringExpenses, months],
  );

  const goalRows: CompareRow[] = useMemo(
    () =>
      savingsGoals.map((g) => ({
        id: g.id,
        label: g.label,
        values: months.map(
          (m) => m.savings.find((s) => s.savingsGoalId === g.id)?.amount,
        ),
      })),
    [savingsGoals, months],
  );

  const columnTotals = (rows: CompareRow[]) =>
    Array.from({ length: 12 }, (_, i) =>
      rows.reduce((sum, row) => sum + (row.values[i] ?? 0), 0),
    );

  const hasData = expenseRows.length > 0 || goalRows.length > 0;

  return (
    <div className="min-h-screen bg-[#eef1f6] px-4 py-8 sm:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-100 text-sky-700">
              <GridViewIcon />
            </span>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Compare</h1>
              <p className="mt-1 text-sm text-slate-500">
                Recurring expenses and savings goals, side by side across the
                year — the spreadsheet view.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setYear(year - 1)}
              className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-slate-600 transition hover:bg-slate-50"
              aria-label="Previous year"
            >
              <FontAwesomeIcon icon={faAngleLeft} className="h-3 w-3" />
            </button>
            <span className="min-w-[3.5rem] text-center font-semibold text-slate-800">
              {year}
            </span>
            <button
              type="button"
              onClick={() => setYear(year + 1)}
              className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-slate-600 transition hover:bg-slate-50"
              aria-label="Next year"
            >
              <FontAwesomeIcon icon={faAngleRight} className="h-3 w-3" />
            </button>
          </div>
        </div>

        {!hasData ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
            <p className="text-sm text-slate-500">
              No recurring expenses or savings goals yet — add some on the{" "}
              <a href="/expenses" className="text-violet-600 hover:underline">
                Expenses
              </a>{" "}
              or{" "}
              <a href="/savings" className="text-violet-600 hover:underline">
                Savings
              </a>{" "}
              pages and they&apos;ll line up here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
            <table className="w-full min-w-max border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="sticky left-0 z-10 min-w-[180px] bg-white px-4 py-3 text-left font-semibold text-slate-700">
                    Item
                  </th>
                  {MONTH_NAMES.map((name, i) => (
                    <th
                      key={name}
                      className={`min-w-[84px] px-3 py-3 text-right font-semibold text-slate-700 ${
                        i === currentMonthIndex ? "bg-violet-50" : ""
                      }`}
                    >
                      {name.slice(0, 3)}
                    </th>
                  ))}
                  <th className="min-w-[100px] px-4 py-3 text-right font-semibold text-slate-700">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody>
                {expenseRows.length > 0 ? (
                  <>
                    <CompareSectionHeader label="Recurring Expenses" />
                    {expenseRows.map((row) => (
                      <CompareRowLine
                        key={row.id}
                        row={row}
                        currentMonthIndex={currentMonthIndex}
                        amountClass="text-rose-600"
                      />
                    ))}
                    <CompareTotalsRow
                      label="Outgoings total"
                      totals={columnTotals(expenseRows)}
                      currentMonthIndex={currentMonthIndex}
                      amountClass="text-rose-700"
                    />
                  </>
                ) : null}

                {goalRows.length > 0 ? (
                  <>
                    <CompareSectionHeader label="Savings Goals" />
                    {goalRows.map((row) => (
                      <CompareRowLine
                        key={row.id}
                        row={row}
                        currentMonthIndex={currentMonthIndex}
                        amountClass="text-violet-600"
                      />
                    ))}
                    <CompareTotalsRow
                      label="Savings total"
                      totals={columnTotals(goalRows)}
                      currentMonthIndex={currentMonthIndex}
                      amountClass="text-violet-700"
                    />
                  </>
                ) : null}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function CompareRowLine({
  row,
  currentMonthIndex,
  amountClass,
}: {
  row: CompareRow;
  currentMonthIndex: number;
  amountClass: string;
}) {
  const total = row.values.reduce<number>((sum, v) => sum + (v ?? 0), 0);
  return (
    <tr className="border-b border-slate-50 last:border-0 hover:bg-slate-50/60">
      <td className="sticky left-0 z-10 bg-white px-4 py-2.5 font-medium text-slate-800">
        {row.label}
      </td>
      {row.values.map((value, i) => (
        <td
          key={i}
          className={`px-3 py-2.5 text-right tabular-nums ${
            i === currentMonthIndex ? "bg-violet-50" : ""
          } ${value == null ? "text-slate-300" : amountClass}`}
        >
          {value == null ? "–" : formatGBP(value)}
        </td>
      ))}
      <td className={`px-4 py-2.5 text-right font-semibold tabular-nums ${amountClass}`}>
        {formatGBP(total)}
      </td>
    </tr>
  );
}

function CompareSectionHeader({ label }: { label: string }) {
  return (
    <tr>
      <td
        colSpan={14}
        className="bg-slate-50 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-500"
      >
        {label}
      </td>
    </tr>
  );
}

function CompareTotalsRow({
  label,
  totals,
  currentMonthIndex,
  amountClass,
}: {
  label: string;
  totals: number[];
  currentMonthIndex: number;
  amountClass: string;
}) {
  const grandTotal = totals.reduce((sum, v) => sum + v, 0);
  return (
    <tr className="border-b border-slate-100 bg-slate-50/60 font-semibold">
      <td className="sticky left-0 z-10 bg-slate-50/60 px-4 py-2.5 text-slate-700">
        {label}
      </td>
      {totals.map((value, i) => (
        <td
          key={i}
          className={`px-3 py-2.5 text-right tabular-nums ${amountClass} ${
            i === currentMonthIndex ? "bg-violet-100" : ""
          }`}
        >
          {formatGBP(value)}
        </td>
      ))}
      <td className={`px-4 py-2.5 text-right tabular-nums ${amountClass}`}>
        {formatGBP(grandTotal)}
      </td>
    </tr>
  );
}
