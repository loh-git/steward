"use client";

import { useState } from "react";
import type { TakeHomeResult } from "@/types/takeHome";
import { formatGBP } from "@/utils/format/currency";
import { BriefcaseIcon, ChevronDownIcon } from "./icons";

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
  // Collapsed by default — seeing exactly how much disappears to tax, NI,
  // pension, and student loan can be discouraging for some people. The
  // take-home figures (the actual point of this card) always stay visible;
  // the breakdown is opt-in.
  const [showBreakdown, setShowBreakdown] = useState(false);

  return (
    // h-full + flex-col + mt-auto on the disclaimer below: this card sits in
    // a two-column grid next to the trend chart, which stretches both cells
    // to match row height. Collapsing the breakdown makes this card shorter
    // by default, so any extra stretched height now collects as breathing
    // room above the disclaimer instead of leaving an awkward gap mid-card —
    // the chart's own sizing is untouched either way.
    <div className="flex h-full flex-col rounded-lg border border-strongroom-500 bg-strongroom-900 p-6 text-white shadow-lg">
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

      <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
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

      {currentMonthPay ? (
        <div className="mb-5 flex items-center justify-between rounded-md bg-strongroom-500 px-4 py-3 text-sm">
          <div>
            <span className="text-white/70">This month’s pay</span>
            <div className="mt-0.5 text-xs text-white/50">
              Pay date: {currentMonthPay.payDateLabel}
            </div>
          </div>
          <span className="font-semibold text-bottle-300">
            {formatGBP(currentMonthPay.amount)}
          </span>
        </div>
      ) : null}

      <button
        type="button"
        onClick={() => setShowBreakdown((v) => !v)}
        aria-expanded={showBreakdown}
        className="flex items-center gap-1.5 self-start text-[11px] font-semibold tracking-wide text-ledger-300 transition hover:text-ledger-200"
      >
        {showBreakdown ? "Hide breakdown" : "Show breakdown"}
        <ChevronDownIcon
          className={`h-3 w-3 transition-transform ${showBreakdown ? "rotate-180" : ""}`}
        />
      </button>

      {showBreakdown ? (
        <div className="mt-3">
          <p className="mb-2 flex items-center justify-between text-[11px] font-semibold tracking-wider text-white/50">
            <span>GROSS {formatGBP(result.grossAnnual)}</span>
            <span>WHERE IT GOES</span>
          </p>
          <div className="flex h-[14px] w-full overflow-hidden rounded-sm">
            <div
              className="bg-bottle-400"
              style={{ width: `${Math.max((result.netAnnual / (result.grossAnnual || 1)) * 100, 0)}%` }}
              title="Net take-home"
            />
            <div
              className="bg-ledger-500"
              style={{ width: `${Math.max((deductions.incomeTax / (result.grossAnnual || 1)) * 100, 0)}%` }}
              title="Income tax"
            />
            <div
              className="bg-ledger-300"
              style={{ width: `${Math.max((deductions.nationalInsurance / (result.grossAnnual || 1)) * 100, 0)}%` }}
              title="National Insurance"
            />
            <div
              className="bg-brass-400"
              style={{ width: `${Math.max((deductions.pension / (result.grossAnnual || 1)) * 100, 0)}%` }}
              title="Pension"
            />
            <div
              className="bg-brass-200"
              style={{ width: `${Math.max((deductions.studentLoan / (result.grossAnnual || 1)) * 100, 0)}%` }}
              title="Student loan"
            />
          </div>

          <dl className="mt-3 grid grid-cols-2 gap-x-6 gap-y-1.5 text-xs text-white/60 sm:grid-cols-3">
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 shrink-0 rounded-full bg-bottle-400" />
              Net {formatGBP(result.netAnnual)}
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 shrink-0 rounded-full bg-ledger-500" />
              Tax {formatGBP(deductions.incomeTax)}
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 shrink-0 rounded-full bg-ledger-300" />
              NI {formatGBP(deductions.nationalInsurance)}
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 shrink-0 rounded-full bg-brass-400" />
              Pension {formatGBP(deductions.pension)}
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 shrink-0 rounded-full bg-brass-200" />
              Student loan {formatGBP(deductions.studentLoan)}
            </div>
          </dl>

          <div className="mt-3 flex items-center justify-between rounded-md bg-strongroom-500 px-4 py-3 text-sm">
            <span className="text-white/70">Total Annual Deductions:</span>
            <span className="font-semibold text-ledger-300">
              −{formatGBP(result.totalDeductionsAnnual)} / year
            </span>
          </div>
        </div>
      ) : null}

      <p className="mt-auto pt-4 text-[11px] leading-snug text-white/45">
        These figures are estimates for planning purposes only and do not
        constitute financial or tax advice. Consult a qualified professional
        before making financial decisions.
      </p>
    </div>
  );
}
