import type { TakeHomeResult } from "@/utils/take-home/calculate";
import { formatGBP } from "@/utils/format/currency";
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
    <div className="rounded-lg border border-strongroom-500 bg-strongroom-900 p-6 text-white shadow-lg">
      <div className="mb-5 flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10">
            <BriefcaseIcon className="text-white" />
          </span>
          <h2 className="font-display text-lg font-semibold">Take-home Pay</h2>
        </div>
        <span className="rounded bg-bottle-500/20 px-3 py-1 text-[11px] font-bold tracking-wide text-bottle-300">
          UK PAYE CALCULATED
        </span>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <p className="text-[11px] font-semibold tracking-wider text-white/60">
            MONTHLY TAKE-HOME
          </p>
          <p className="font-display text-3xl font-bold text-bottle-300">
            {formatGBP(result.netMonthly)}
          </p>
        </div>
        <div>
          <p className="text-[11px] font-semibold tracking-wider text-white/60">
            YEARLY TAKE-HOME
          </p>
          <p className="font-display text-3xl font-bold">{formatGBP(result.netAnnual)}</p>
        </div>
      </div>

      <dl className="grid grid-cols-1 gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
        <div className="flex justify-between sm:block">
          <dt className="text-white/60">Gross annual</dt>
          <dd className="font-medium">{formatGBP(result.grossAnnual)}</dd>
        </div>
        <div className="flex justify-between sm:block">
          <dt className="text-white/60">Income tax</dt>
          <dd className="font-medium text-ledger-300">
            −{formatGBP(deductions.incomeTax)}
          </dd>
        </div>
        <div className="flex justify-between sm:block">
          <dt className="text-white/60">National Insurance</dt>
          <dd className="font-medium text-ledger-300">
            −{formatGBP(deductions.nationalInsurance)}
          </dd>
        </div>
        <div className="flex justify-between sm:block">
          <dt className="text-white/60">Pension (auto-enrol)</dt>
          <dd className="font-medium text-ledger-300">
            −{formatGBP(deductions.pension)}
          </dd>
        </div>
        <div className="flex justify-between sm:col-span-2 sm:block">
          <dt className="text-white/60">Student loan</dt>
          <dd className="font-medium text-ledger-300">
            −{formatGBP(deductions.studentLoan)}
          </dd>
        </div>
      </dl>

      <div className="mt-6 rounded-md bg-strongroom-500 px-4 py-3 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-white/70">Total Annual Deductions:</span>
          <span className="font-semibold text-ledger-300">
            −{formatGBP(result.totalDeductionsAnnual)} / year
          </span>
        </div>
        {currentMonthPay ? (
          <div className="mt-3 border-t border-white/10 pt-3">
            <div className="flex items-center justify-between">
              <span className="text-white/70">This month’s pay</span>
              <span className="font-semibold text-bottle-300">
                {formatGBP(currentMonthPay.amount)}
              </span>
            </div>
            <div className="mt-1 text-xs text-white/50">
              Pay date: {currentMonthPay.payDateLabel}
            </div>
          </div>
        ) : null}
      </div>

      <p className="mt-4 text-[11px] leading-snug text-white/45">
        These figures are estimates for planning purposes only and do not
        constitute financial or tax advice. Consult a qualified professional
        before making financial decisions.
      </p>
    </div>
  );
}
