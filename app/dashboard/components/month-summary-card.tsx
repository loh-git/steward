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
      className={`flex min-h-[220px] w-full flex-col rounded-2xl border bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-violet-300 hover:shadow-md ${
        isCurrentMonth
          ? "border-violet-500 border-2 shadow-[0_0_0_1px_rgba(139,92,246,0.2)]"
          : "border-slate-200"
      }`}
    >
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-semibold text-slate-900">
          {MONTH_NAMES[entry.month - 1]}
        </h3>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2 text-slate-600">
            <IncomeIcon className="text-emerald-600" />
            Income
          </span>
          <span className="font-semibold text-emerald-600">
            {formatSignedGBP(totalIncome)}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2 text-slate-600">
            <ReceiptIcon className="text-rose-500" />
            Outgoings
          </span>
          <span className="font-semibold text-rose-500">
            {totalOutgoings > 0
              ? `−${formatGBP(totalOutgoings)}`
              : formatGBP(0)}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2 text-slate-600">
            <PiggyBankIcon className="text-violet-600" />
            Savings
          </span>
          <span className="font-semibold text-violet-600">
            {totalSavings > 0 ? `−${formatGBP(totalSavings)}` : formatGBP(0)}
          </span>
        </div>
      </div>

      <div className="mt-4 flex h-2 overflow-hidden rounded-full bg-slate-100">
        {outPct > 0 ? (
          <div
            className="bg-rose-300"
            style={{ width: `${outPct}%` }}
            title="Outgoings"
          />
        ) : null}
        {savePct > 0 ? (
          <div
            className="bg-violet-300"
            style={{ width: `${savePct}%` }}
            title="Savings"
          />
        ) : null}
        {remainPct > 0 ? (
          <div
            className="bg-emerald-300"
            style={{ width: `${remainPct}%` }}
            title="Remaining"
          />
        ) : null}
      </div>

      <div className="mt-auto flex items-end justify-between pt-4">
        <span className="text-[10px] font-semibold tracking-wider text-slate-400">
          REMAINING
        </span>
        <span className="text-xl font-bold text-slate-900">
          {formatGBP(remaining)}
        </span>
      </div>
    </button>
  );
}
