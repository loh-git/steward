import type { TakeHomeResult } from "@/types/takeHome";
import { formatGBP } from "@/utils/format/currency";

type TakeHomeSummaryProps = {
  result: TakeHomeResult;
  taxYear: string;
  regionLabel: string;
};

export default function TakeHomeSummary({
  result,
  taxYear,
  regionLabel,
}: TakeHomeSummaryProps) {
  if (!result.hasIncome) {
    return (
      <section className="rounded-lg border border-dashed border-ink-300 bg-paper-card p-6">
        <h2 className="mb-2 font-display text-xl font-semibold text-ink-900">
          Estimated take-home pay
        </h2>
        <p className="text-sm text-ink-500">
          Enter your annual gross salary to see monthly and yearly take-home
          estimates.
        </p>
      </section>
    );
  }

  const { deductions } = result;

  return (
    <section className="rounded-lg border border-bottle-200 bg-paper-card p-6 shadow-sm">
      <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="font-display text-xl font-semibold text-ink-900">
          Estimated take-home pay
        </h2>
        <p className="text-xs text-ink-500">
          {taxYear} · {regionLabel} · illustrative only
        </p>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-lg bg-bottle-50 p-4">
          <p className="mb-1 text-sm text-bottle-800">
            Monthly take-home
          </p>
          <p className="font-display text-3xl font-bold text-bottle-900">
            {formatGBP(result.netMonthly)}
          </p>
        </div>
        <div className="rounded-lg bg-ink-50 p-4">
          <p className="mb-1 text-sm text-ink-600">
            Yearly take-home
          </p>
          <p className="font-display text-3xl font-bold text-ink-900">
            {formatGBP(result.netAnnual)}
          </p>
        </div>
      </div>

      <dl className="grid grid-cols-2 gap-3 border-t border-ink-200 pt-4 text-sm sm:grid-cols-3">
        <div>
          <dt className="text-ink-500">Gross (annual)</dt>
          <dd className="font-medium text-ink-800">{formatGBP(result.grossAnnual)}</dd>
        </div>
        <div>
          <dt className="text-ink-500">Income tax</dt>
          <dd className="font-medium text-ink-800">−{formatGBP(deductions.incomeTax)}</dd>
        </div>
        <div>
          <dt className="text-ink-500">National Insurance</dt>
          <dd className="font-medium text-ink-800">
            −{formatGBP(deductions.nationalInsurance)}
          </dd>
        </div>
        <div>
          <dt className="text-ink-500">Pension</dt>
          <dd className="font-medium text-ink-800">−{formatGBP(deductions.pension)}</dd>
        </div>
        <div>
          <dt className="text-ink-500">Student loan</dt>
          <dd className="font-medium text-ink-800">−{formatGBP(deductions.studentLoan)}</dd>
        </div>
        <div>
          <dt className="text-ink-500">Gross (monthly)</dt>
          <dd className="font-medium text-ink-800">{formatGBP(result.grossMonthly)}</dd>
        </div>
      </dl>

      <p className="mt-4 text-xs text-ink-500">
        Based on UK PAYE rules similar to{" "}
        <a
          href="https://www.thesalarycalculator.co.uk/salary.php"
          className="text-ledger-600 hover:underline"
          target="_blank"
          rel="noreferrer"
        >
          The Salary Calculator
        </a>
        . Not financial advice — verify with HMRC or a qualified adviser before
        major decisions.
      </p>
    </section>
  );
}
