import type { TakeHomeResult } from "@/lib/take-home/calculate";
import { formatGBP } from "@/lib/format/currency";
import { BriefcaseIcon } from "./icons";

export default function TakeHomeCard({
  result,
  currentMonthPay,
}: {
  result: TakeHomeResult;
  currentMonthPay?: {
    amount: number;
    payDateLabel: string;
  };
}) {
  const { deductions } = result;

  return (
    <div className="rounded-2xl bg-[#1e2a4a] p-6 text-white shadow-lg">
      <div className="mb-5 flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10">
            <BriefcaseIcon className="text-white" />
          </span>
          <h2 className="text-lg font-semibold">Take-home Pay</h2>
        </div>
        <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-[10px] font-bold tracking-wide text-emerald-300">
          UK PAYE CALCULATED
        </span>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <p className="text-[11px] font-semibold tracking-wider text-slate-400">
            MONTHLY TAKE-HOME
          </p>
          <p className="text-3xl font-bold text-emerald-400">
            {formatGBP(result.netMonthly)}
          </p>
        </div>
        <div>
          <p className="text-[11px] font-semibold tracking-wider text-slate-400">
            YEARLY TAKE-HOME
          </p>
          <p className="text-3xl font-bold">{formatGBP(result.netAnnual)}</p>
        </div>
      </div>

      <dl className="grid grid-cols-1 gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
        <div className="flex justify-between sm:block">
          <dt className="text-slate-400">Gross annual</dt>
          <dd className="font-medium">{formatGBP(result.grossAnnual)}</dd>
        </div>
        <div className="flex justify-between sm:block">
          <dt className="text-slate-400">Income tax</dt>
          <dd className="font-medium text-rose-300">
            −{formatGBP(deductions.incomeTax)}
          </dd>
        </div>
        <div className="flex justify-between sm:block">
          <dt className="text-slate-400">National Insurance</dt>
          <dd className="font-medium text-rose-300">
            −{formatGBP(deductions.nationalInsurance)}
          </dd>
        </div>
        <div className="flex justify-between sm:block">
          <dt className="text-slate-400">Pension (auto-enrol)</dt>
          <dd className="font-medium text-rose-300">
            −{formatGBP(deductions.pension)}
          </dd>
        </div>
        <div className="flex justify-between sm:col-span-2 sm:block">
          <dt className="text-slate-400">Student loan</dt>
          <dd className="font-medium text-rose-300">
            −{formatGBP(deductions.studentLoan)}
          </dd>
        </div>
      </dl>

      <div className="mt-6 rounded-xl bg-[#2a3560] px-4 py-3 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-slate-300">Total Annual Deductions:</span>
          <span className="font-semibold text-rose-300">
            −{formatGBP(result.totalDeductionsAnnual)} / year
          </span>
        </div>
        {currentMonthPay ? (
          <div className="mt-3 border-t border-white/10 pt-3">
            <div className="flex items-center justify-between">
              <span className="text-slate-300">This month’s pay</span>
              <span className="font-semibold text-emerald-300">
                {formatGBP(currentMonthPay.amount)}
              </span>
            </div>
            <div className="mt-1 text-xs text-slate-400">
              Pay date: {currentMonthPay.payDateLabel}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
