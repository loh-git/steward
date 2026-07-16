import Link from "next/link";
import type { FinancialInfo } from "@/app/setup/types";
import { formatGBP } from "@/lib/format/currency";
import { SettingsIcon, UserIcon } from "./icons";

type ProfileCardProps = {
  firstName: string;
  lastName: string;
  financialInfo: FinancialInfo;
  studentLoanLabel: string;
  lastUpdated: string;
};

function pensionLabel(fi: FinancialInfo): string {
  const scheme =
    fi.pension.scheme === "auto-enrolment"
      ? "Pension auto-enrolment"
      : `Pension ${fi.pension.scheme}`;
  const value =
    fi.pension.type === "percentage"
      ? `${fi.pension.value}%`
      : `${formatGBP(fi.pension.value)}/mo`;
  const qualifying = fi.pension.basedOnQualifyingEarnings ? " (qualifying)" : "";
  return `${scheme}: ${value}${qualifying}`;
}

export default function ProfileCard({
  firstName,
  lastName,
  financialInfo: fi,
  studentLoanLabel,
  lastUpdated,
}: ProfileCardProps) {
  const taxCode = fi.taxCode?.trim() || "1257L";

  return (
    <div className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-5 flex items-start justify-between gap-3">
        <div className="flex items-center gap-2 text-slate-800">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-violet-100 text-violet-700">
            <UserIcon />
          </span>
          <h2 className="text-lg font-semibold">Your Profile</h2>
        </div>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-[10px] font-bold tracking-wide text-slate-600">
          LAST UPDATED: {lastUpdated}
        </span>
      </div>

      <dl className="grid grid-cols-1 gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-slate-500">Name</dt>
          <dd className="font-medium text-slate-900">
            {firstName} {lastName}
          </dd>
        </div>
        <div>
          <dt className="text-slate-500">Gross Salary</dt>
          <dd className="font-semibold text-violet-700">
            {formatGBP(fi.annualIncome)} / year
          </dd>
        </div>
        <div>
          <dt className="text-slate-500">Tax Year</dt>
          <dd className="font-medium text-slate-900">{fi.taxYear}</dd>
        </div>
        <div>
          <dt className="text-slate-500">Region</dt>
          <dd className="font-medium text-slate-900">
            {fi.residentInScotland ? "Scotland" : "England, Wales & NI"}
          </dd>
        </div>
        <div>
          <dt className="text-slate-500">Tax Code</dt>
          <dd className="font-medium text-slate-900">{taxCode}</dd>
        </div>
        <div>
          <dt className="text-slate-500">Pension</dt>
          <dd className="font-medium text-slate-900">{pensionLabel(fi)}</dd>
        </div>
        <div className="sm:col-span-2">
          <dt className="text-slate-500">Student loan</dt>
          <dd className="font-medium text-slate-900">{studentLoanLabel}</dd>
        </div>
      </dl>

      <Link
        href="/setup"
        className="mt-auto flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
      >
        <SettingsIcon />
        Edit financial profile
      </Link>
    </div>
  );
}
