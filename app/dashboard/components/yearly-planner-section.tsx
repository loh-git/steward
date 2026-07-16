import type { MonthlyEntry } from "@/types/monthlyPlan";
import { ChartIcon } from "./icons";
import MonthSummaryCard from "./month-summary-card";

type YearlyPlannerSectionProps = {
  year: number;
  onYearChange: (year: number) => void;
  months: MonthlyEntry[];
  baseNetMonthly: number;
  onZoomMonth: (month: number) => void;
};

export default function YearlyPlannerSection({
  year,
  onYearChange,
  months,
  baseNetMonthly,
  onZoomMonth,
}: YearlyPlannerSectionProps) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-5">
        <div className="flex items-center gap-2 text-sm font-bold tracking-wide text-slate-700">
          <ChartIcon className="h-4 w-4 text-violet-600" />
          YEARLY PLANNER OVERVIEW
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onYearChange(year - 1)}
            className="rounded-lg border border-slate-200 px-2.5 py-1 text-sm text-slate-600 transition hover:bg-slate-50"
            aria-label="Previous year"
          >
            ‹
          </button>
          <span className="min-w-[3rem] text-center font-semibold text-slate-800">
            {year}
          </span>
          <button
            type="button"
            onClick={() => onYearChange(year + 1)}
            className="rounded-lg border border-slate-200 px-2.5 py-1 text-sm text-slate-600 transition hover:bg-slate-50"
            aria-label="Next year"
          >
            ›
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {months.map((entry) => (
          <MonthSummaryCard
            key={`${entry.year}-${entry.month}`}
            entry={entry}
            baseNetMonthly={baseNetMonthly}
            onZoom={() => onZoomMonth(entry.month)}
          />
        ))}
      </div>
    </section>
  );
}
