import type { TakeHomeResult } from "@/lib/take-home/calculate";
import { formatGBP } from "@/lib/take-home/calculate";

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
      <section className="rounded-lg border border-dashed border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-6">
        <h2 className="text-xl font-semibold mb-2">Estimated take-home pay</h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Enter your annual gross salary to see monthly and yearly take-home
          estimates.
        </p>
      </section>
    );
  }

  const { deductions } = result;

  return (
    <section className="rounded-lg border border-emerald-200 dark:border-emerald-900 bg-white dark:bg-zinc-900 p-6 shadow-sm">
      <div className="flex flex-wrap items-baseline justify-between gap-2 mb-4">
        <h2 className="text-xl font-semibold">Estimated take-home pay</h2>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          {taxYear} · {regionLabel} · illustrative only
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div className="rounded-lg bg-emerald-50 dark:bg-emerald-950/40 p-4">
          <p className="text-sm text-emerald-800 dark:text-emerald-300 mb-1">
            Monthly take-home
          </p>
          <p className="text-3xl font-bold text-emerald-900 dark:text-emerald-100">
            {formatGBP(result.netMonthly)}
          </p>
        </div>
        <div className="rounded-lg bg-zinc-50 dark:bg-zinc-800/50 p-4">
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-1">
            Yearly take-home
          </p>
          <p className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
            {formatGBP(result.netAnnual)}
          </p>
        </div>
      </div>

      <dl className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm border-t border-zinc-200 dark:border-zinc-800 pt-4">
        <div>
          <dt className="text-zinc-500">Gross (annual)</dt>
          <dd className="font-medium">{formatGBP(result.grossAnnual)}</dd>
        </div>
        <div>
          <dt className="text-zinc-500">Income tax</dt>
          <dd className="font-medium">−{formatGBP(deductions.incomeTax)}</dd>
        </div>
        <div>
          <dt className="text-zinc-500">National Insurance</dt>
          <dd className="font-medium">−{formatGBP(deductions.nationalInsurance)}</dd>
        </div>
        <div>
          <dt className="text-zinc-500">Pension</dt>
          <dd className="font-medium">−{formatGBP(deductions.pension)}</dd>
        </div>
        <div>
          <dt className="text-zinc-500">Student loan</dt>
          <dd className="font-medium">−{formatGBP(deductions.studentLoan)}</dd>
        </div>
        <div>
          <dt className="text-zinc-500">Gross (monthly)</dt>
          <dd className="font-medium">{formatGBP(result.grossMonthly)}</dd>
        </div>
      </dl>

      <p className="mt-4 text-xs text-zinc-500 dark:text-zinc-400">
        Based on UK PAYE rules similar to{" "}
        <a
          href="https://www.thesalarycalculator.co.uk/salary.php"
          className="text-blue-600 hover:underline"
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
