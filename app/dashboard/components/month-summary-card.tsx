import { formatGBP, formatSignedGBP } from "@/utils/format/currency";
import type { MonthlyEntry } from "@/types/monthlyPlan";
import { MONTH_NAMES, summariseMonth } from "@/types/monthlyPlan";
import { IncomeIcon, PiggyBankIcon, ReceiptIcon } from "./icons";

type MonthSummaryCardProps = {
  entry: MonthlyEntry;
  baseNetMonthly: number;
  onZoom: () => void;
};

export default function MonthSummaryCard({
  entry,
  baseNetMonthly,
  onZoom,
}: MonthSummaryCardProps) {
  const { totalIncome, totalOutgoings, totalSavings, remaining } =
    summariseMonth(entry, baseNetMonthly);

  const outPct = totalIncome > 0 ? (totalOutgoings / totalIncome) * 100 : 0;
  const savePct = totalIncome > 0 ? (totalSavings / totalIncome) * 100 : 0;
  const remainPct = Math.max(100 - outPct - savePct, 0);

  const today = new Date();
  const isCurrentMonth =
    entry.year === today.getFullYear() && entry.month === today.getMonth() + 1;

  return (
    <button
      type="button"
      onClick={onZoom}
      className={`flex min-h-[220px] w-full flex-col rounded-lg border bg-paper-card p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-ledger-300 hover:shadow-md ${
        isCurrentMonth
          ? "border-ledger-500 border-2 shadow-[0_0_0_1px_rgba(163,38,56,0.2)]"
          : "border-ink-200"
      }`}
    >
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-display font-semibold text-ink-900">
          {MONTH_NAMES[entry.month - 1]}
        </h3>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2 text-ink-600">
            <IncomeIcon className="text-bottle-600" />
            Income
          </span>
          <span className="font-semibold text-bottle-600">
            {formatSignedGBP(totalIncome)}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2 text-ink-600">
            <ReceiptIcon className="text-ledger-600" />
            Outgoings
          </span>
          <span className="font-semibold text-ledger-600">
            {totalOutgoings > 0
              ? `−${formatGBP(totalOutgoings)}`
              : formatGBP(0)}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2 text-ink-600">
            <PiggyBankIcon className="text-brass-600" />
            Savings
          </span>
          <span className="font-semibold text-brass-600">
            {totalSavings > 0 ? `−${formatGBP(totalSavings)}` : formatGBP(0)}
          </span>
        </div>
      </div>

      <div className="mt-4 flex h-2 overflow-hidden rounded bg-ink-100">
        {outPct > 0 ? (
          <div
            className="bg-ledger-300"
            style={{ width: `${outPct}%` }}
            title="Outgoings"
          />
        ) : null}
        {savePct > 0 ? (
          <div
            className="bg-brass-300"
            style={{ width: `${savePct}%` }}
            title="Savings"
          />
        ) : null}
        {remainPct > 0 ? (
          <div
            className="bg-bottle-300"
            style={{ width: `${remainPct}%` }}
            title="Remaining"
          />
        ) : null}
      </div>

      <div className="mt-auto flex items-end justify-between pt-4">
        <span className="text-[11px] font-semibold tracking-wider text-ink-400">
          REMAINING
        </span>
        <span className="text-xl font-bold text-ink-900">
          {formatGBP(remaining)}
        </span>
      </div>
    </button>
  );
}
