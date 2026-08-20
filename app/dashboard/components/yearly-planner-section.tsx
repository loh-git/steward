import type { MonthlyEntry } from "@/types/monthlyPlan";
import { ChartIcon } from "./icons";
import MonthSummaryCard from "./month-summary-card";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleLeft, faAngleRight } from "@fortawesome/free-solid-svg-icons";

type YearlyPlannerSectionProps = {
  year: number;
  onYearChange: (year: number) => void;
  months: MonthlyEntry[];
  getBaseNetMonthly: (year: number, month: number) => number;
  onZoomMonth: (month: number) => void;
  showAllMonths: boolean;
  onShowAllMonthsChange: () => void;
};

export default function YearlyPlannerSection({
  year,
  onYearChange,
  months,
  getBaseNetMonthly,
  onZoomMonth,
  showAllMonths,
  onShowAllMonthsChange,
}: YearlyPlannerSectionProps) {
  const styles = {
    chevronButtons:
      "rounded border border-ink-200 px-1.5 py-1 text-sm text-ink-600 transition hover:bg-ink-50",
  };

  return (
    <section className="rounded-lg border border-ink-200 bg-paper-card p-5 shadow-sm sm:p-6">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-ink-100 pb-5">
        <div className="flex items-center gap-2 text-sm font-bold tracking-wide text-ink-700">
          <ChartIcon className="h-4 w-4 text-ledger-600" />
          YEARLY PLANNER OVERVIEW
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="rounded border border-ink-200 px-2.5 py-0.5 text-md text-white bg-ledger-600 transition hover:bg-ledger-500"
            onClick={onShowAllMonthsChange}
          >
            {showAllMonths ? "Show Remaining Months" : "Show All Months"}
          </button>
          <button
            type="button"
            onClick={() => onYearChange(year - 1)}
            className={styles.chevronButtons}
            aria-label="Previous year"
          >
            <FontAwesomeIcon icon={faAngleLeft} className="h-3 w-3" />
          </button>
          <span className="min-w-[3rem] text-center font-semibold text-ink-800">
            {year}
          </span>
          <button
            type="button"
            onClick={() => onYearChange(year + 1)}
            className={styles.chevronButtons}
            aria-label="Next year"
          >
            <FontAwesomeIcon icon={faAngleRight} className="h-3 w-3" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {months.map((entry) => (
          <MonthSummaryCard
            key={`${entry.year}-${entry.month}`}
            entry={entry}
            baseNetMonthly={getBaseNetMonthly(entry.year, entry.month)}
            onZoom={() => onZoomMonth(entry.month)}
          />
        ))}
      </div>
    </section>
  );
}
