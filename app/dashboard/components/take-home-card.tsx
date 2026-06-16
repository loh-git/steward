import type { TakeHomeResult } from "@/lib/take-home/calculate";
import { formatGBP } from "@/lib/take-home/calculate";

export default function TakeHomeCard({ result }: { result: TakeHomeResult }) {
  const { deductions } = result;

  return (
    <div className="bg-white dark:bg-zinc-900 p-6 rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">Take-home pay</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div>
          <p className="text-sm text-zinc-500">Monthly</p>
          <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">
            {formatGBP(result.netMonthly)}
          </p>
        </div>
        <div>
          <p className="text-sm text-zinc-500">Yearly</p>
          <p className="text-2xl font-bold">{formatGBP(result.netAnnual)}</p>
        </div>
      </div>
      <ul className="text-sm space-y-1 text-zinc-600 dark:text-zinc-400">
        <li className="flex justify-between">
          <span>Gross (annual)</span>
          <span>{formatGBP(result.grossAnnual)}</span>
        </li>
        <li className="flex justify-between">
          <span>Income tax</span>
          <span>−{formatGBP(deductions.incomeTax)}</span>
        </li>
        <li className="flex justify-between">
          <span>National Insurance</span>
          <span>−{formatGBP(deductions.nationalInsurance)}</span>
        </li>
        <li className="flex justify-between">
          <span>Pension</span>
          <span>−{formatGBP(deductions.pension)}</span>
        </li>
        <li className="flex justify-between">
          <span>Student loan</span>
          <span>−{formatGBP(deductions.studentLoan)}</span>
        </li>
      </ul>
      <a
        href="/setup"
        className="inline-block mt-4 text-sm text-blue-600 hover:underline"
      >
        Edit financial profile
      </a>
    </div>
  );
}
