"use client";

import { useState, useId, useMemo } from "react";

import Section from "@/app/setup/components/section";
import { saveFinancialProfile } from "./actions";
import Input from "@/app/setup/components/input";
import Select from "@/app/setup/components/select";
import TakeHomeSummary from "@/app/setup/components/take-home-summary";
import { calculateTakeHome } from "@/utils/take-home/calculate";
import {
  type FinancialProfilePayload,
  type PayFrequency,
  type SalarySacrificeFrequency,
  type TaxYear,
} from "@/types/financialProfile";
import { applyFieldUpdate, createInitialPayload, parseInputValue } from "./utils";

const TAX_YEAR_OPTIONS: { value: TaxYear; label: string }[] = [
  { value: "2024/25", label: "2024 / 25" },
  { value: "2025/26", label: "2025 / 26" },
  { value: "2026/27", label: "2026 / 27" },
];

const PAY_FREQUENCY_OPTIONS: { value: PayFrequency; label: string }[] = [
  { value: "monthly", label: "Monthly" },
  { value: "four-weekly", label: "Four-weekly" },
  { value: "two-weekly", label: "Two-weekly" },
  { value: "weekly", label: "Weekly" },
  { value: "yearly", label: "Yearly" },
];

const SACRIFICE_FREQUENCY_OPTIONS: {
  value: SalarySacrificeFrequency;
  label: string;
}[] = [
  { value: "yearly", label: "Year" },
  { value: "monthly", label: "Month" },
  { value: "weekly", label: "Week" },
];

const PENSION_SCHEME_OPTIONS = [
  { value: "auto-enrolment", label: "Auto-enrolment" },
  { value: "employer", label: "Employer pension" },
  { value: "salary-sacrifice", label: "Salary sacrifice" },
  { value: "personal", label: "Personal pension" },
];

const STUDENT_LOAN_FIELDS = [
  {
    name: "financialInfo.studentLoanPlan.plan1",
    label: "Plan 1",
    hint: "Course started before 1 Sep 2012, or Northern Ireland",
  },
  {
    name: "financialInfo.studentLoanPlan.plan2",
    label: "Plan 2",
    hint: "Course started on or after 1 Sep 2012 (England/Wales)",
  },
  {
    name: "financialInfo.studentLoanPlan.plan4Scotland",
    label: "Plan 4 (Scotland)",
    hint: "Lived in Scotland when you took out the loan",
  },
  {
    name: "financialInfo.studentLoanPlan.plan5",
    label: "Plan 5",
    hint: "Undergraduate course started after 1 Aug 2023 (England)",
  },
  {
    name: "financialInfo.studentLoanPlan.postgraduate",
    label: "Postgraduate loan",
    hint: "Repayments on a postgraduate loan",
  },
] as const;

type SetupFormProps = {
  initialData: FinancialProfilePayload | null;
  userId: string | null;
};

export default function SetupForm({ initialData, userId }: SetupFormProps) {
  const formId = useId().replace(/:/g, "");
  const [formData, setFormData] = useState<FinancialProfilePayload>(
    () => initialData ?? createInitialPayload(userId ?? `draft_${formId}`),
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [payDateError, setPayDateError] = useState<string | null>(null);

  const fi = {
    ...formData.financialInfo,
    payDate: formData.financialInfo.payDate ?? { dayOfMonth: null },
  };
  const takeHome = useMemo(() => calculateTakeHome(fi), [fi]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name } = e.target;
    const value = parseInputValue(e.target);
    setFormData((prev) => applyFieldUpdate(prev, name, value));
  };

  const handlePayDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;

    if (rawValue === "") {
      setPayDateError(null);
      setFormData((prev) =>
        applyFieldUpdate(prev, "financialInfo.payDate.dayOfMonth", null),
      );
      return;
    }

    if (!/^\d+$/.test(rawValue)) {
      setPayDateError("Enter only the day number, for example 28.");
      return;
    }

    const dayOfMonth = Number(rawValue);
    if (dayOfMonth < 1 || dayOfMonth > 31) {
      setPayDateError("Enter a day between 1 and 31.");
      return;
    }

    setPayDateError(null);
    setFormData((prev) =>
      applyFieldUpdate(prev, "financialInfo.payDate.dayOfMonth", dayOfMonth),
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (payDateError) {
      setSubmitting(false);
      return;
    }

    if (
      fi.payDate.dayOfMonth !== null &&
      (fi.payDate.dayOfMonth < 1 || fi.payDate.dayOfMonth > 31)
    ) {
      setPayDateError("Enter a day between 1 and 31.");
      setSubmitting(false);
      return;
    }

    setSubmitting(true);
    try {
      await saveFinancialProfile(formData);
    } catch (err) {
      setSubmitting(false);
      setError(
        err instanceof Error ? err.message : "Failed to save your profile",
      );
    }
  };

  return (
    <div className="min-h-screen bg-paper-canvas p-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="mb-2 font-display text-3xl font-bold text-ink-900">
          Financial Profile Setup
        </h1>
        <p className="mb-1 text-ink-600">
          Welcome to Steward. Tell us about your pay so we can estimate your
          monthly take-home — similar to{" "}
          <a
            href="https://www.thesalarycalculator.co.uk/salary.php"
            className="text-ledger-600 hover:underline"
            target="_blank"
            rel="noreferrer"
          >
            The Salary Calculator
          </a>
          .
        </p>
        <p className="mb-8 text-ink-600">
          Fields mirror UK income tax, National Insurance, pension, and student
          loan inputs for the selected tax year. Your profile is saved to your
          account when you continue.
        </p>

        {error ? (
          <p className="mb-4 rounded border border-ledger-300 bg-ledger-50 px-4 py-2 text-sm text-ledger-800">
            {error}
          </p>
        ) : null}

        <div className="mb-8">
          <TakeHomeSummary
            result={takeHome}
            taxYear={fi.taxYear}
            regionLabel={
              fi.residentInScotland
                ? "Scotland"
                : "England, Wales & Northern Ireland"
            }
          />
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Section title="Personal information">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
              <Input
                type="text"
                label="First name"
                name="userInfo.firstName"
                value={formData.userInfo.firstName}
                onChange={handleChange}
              />
              <Input
                type="text"
                label="Last name"
                name="userInfo.lastName"
                value={formData.userInfo.lastName}
                onChange={handleChange}
              />
              <Input
                type="date"
                label="Date of birth"
                name="userInfo.dob"
                value={formData.userInfo.dob}
                onChange={handleChange}
                hint={
                  formData.userInfo.age > 0
                    ? `Age: ${formData.userInfo.age}`
                    : undefined
                }
              />
            </div>
          </Section>

          <Section title="Salary & tax">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
              <Input
                type="number"
                label="Annual gross salary (£)"
                name="financialInfo.annualIncome"
                value={fi.annualIncome || ""}
                onChange={handleChange}
                min={0}
                step={0.01}
              />
              <Select
                label="Tax year"
                name="financialInfo.taxYear"
                value={fi.taxYear}
                onChange={handleChange}
                options={TAX_YEAR_OPTIONS}
              />
              <Input
                type="number"
                label="Pay date"
                name="financialInfo.payDate.dayOfMonth"
                value={fi.payDate.dayOfMonth ?? ""}
                onChange={handlePayDateChange}
                min={1}
                max={31}
                step={1}
                inputMode="numeric"
                pattern="[0-9]*"
                placeholder="e.g. 28"
                hint="Enter just the day number, for example 28. Do not use 28th or 28/01/2026. Weekend dates roll back to the previous weekday."
              />
              {payDateError ? (
                <p className="text-sm text-ledger-600">
                  {payDateError}
                </p>
              ) : null}
              <Input
                type="text"
                label="Tax code (optional)"
                name="financialInfo.taxCode"
                value={fi.taxCode}
                onChange={handleChange}
                placeholder="e.g. 1257L"
                hint="Leave blank to use the default code for your situation"
              />
              <div className="sm:col-span-2">
                <Input
                  type="checkbox"
                  label="Resident in Scotland"
                  name="financialInfo.residentInScotland"
                  checked={fi.residentInScotland}
                  onChange={handleChange}
                  hint="Scottish income tax rates apply if your main residence is in Scotland"
                />
              </div>
            </div>
          </Section>

          <Section title="Student loans">
            <p className="mb-4 text-sm text-ink-600">
              Tick every repayment plan that applies to you.
            </p>
            <div className="space-y-3">
              {STUDENT_LOAN_FIELDS.map((field) => {
                const key = field.name
                  .split(".")
                  .pop() as keyof typeof fi.studentLoanPlan;
                return (
                  <Input
                    key={field.name}
                    type="checkbox"
                    label={field.label}
                    name={field.name}
                    checked={fi.studentLoanPlan[key]}
                    onChange={handleChange}
                    hint={field.hint}
                  />
                );
              })}
            </div>
          </Section>

          <Section title="Pension">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
              <Select
                label="Pension scheme"
                name="financialInfo.pension.scheme"
                value={fi.pension.scheme}
                onChange={handleChange}
                options={PENSION_SCHEME_OPTIONS}
              />
              <Select
                label="Contribution entered as"
                name="financialInfo.pension.type"
                value={fi.pension.type}
                onChange={handleChange}
                options={[
                  { value: "percentage", label: "Percentage of salary" },
                  { value: "amount", label: "Fixed £ amount" },
                ]}
              />
              <Input
                type="number"
                label={
                  fi.pension.type === "percentage"
                    ? "Contribution (%)"
                    : "Contribution (£ per month)"
                }
                name="financialInfo.pension.value"
                value={fi.pension.value || ""}
                onChange={handleChange}
                min={0}
                step={fi.pension.type === "percentage" ? 0.5 : 1}
              />
              <div className="sm:col-span-2 space-y-2">
                <Input
                  type="checkbox"
                  label="Based on qualifying earnings (not full salary)"
                  name="financialInfo.pension.basedOnQualifyingEarnings"
                  checked={fi.pension.basedOnQualifyingEarnings}
                  onChange={handleChange}
                />
                <Input
                  type="checkbox"
                  label="Include overtime in pensionable pay"
                  name="financialInfo.pension.includeOvertime"
                  checked={fi.pension.includeOvertime}
                  onChange={handleChange}
                />
                <Input
                  type="checkbox"
                  label="Include bonus in pensionable pay"
                  name="financialInfo.pension.includeBonus"
                  checked={fi.pension.includeBonus}
                  onChange={handleChange}
                />
                <Input
                  type="checkbox"
                  label="Include cash allowances in pensionable pay"
                  name="financialInfo.pension.includeCashAllowances"
                  checked={fi.pension.includeCashAllowances}
                  onChange={handleChange}
                />
              </div>
            </div>
          </Section>

          <Section title="Bonus">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                type="number"
                label="Annual bonus (£, one-off)"
                name="financialInfo.bonus.amount"
                value={fi.bonus.amount || ""}
                onChange={handleChange}
                min={0}
              />
              <Select
                label="Normal pay period"
                name="financialInfo.bonus.normalPayPeriod"
                value={fi.bonus.normalPayPeriod}
                onChange={handleChange}
                options={PAY_FREQUENCY_OPTIONS}
                hint="Used to compare a bonus month with a normal month"
              />
            </div>
          </Section>

          <Section title="Overtime">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                type="number"
                label="Overtime hours per month (band 1)"
                name="financialInfo.overtime.hoursPerMonth"
                value={fi.overtime.hoursPerMonth || ""}
                onChange={handleChange}
                min={0}
                step={0.5}
              />
              <Input
                type="number"
                label="Band 1 rate (× normal hourly)"
                name="financialInfo.overtime.rateMultiplier"
                value={fi.overtime.rateMultiplier}
                onChange={handleChange}
                min={1}
                step={0.1}
              />
              <Input
                type="number"
                label="Overtime hours per month (band 2)"
                name="financialInfo.overtime.hoursPerMonthSecond"
                value={fi.overtime.hoursPerMonthSecond || ""}
                onChange={handleChange}
                min={0}
                step={0.5}
              />
              <Input
                type="number"
                label="Band 2 rate (× normal hourly)"
                name="financialInfo.overtime.rateMultiplierSecond"
                value={fi.overtime.rateMultiplierSecond}
                onChange={handleChange}
                min={1}
                step={0.1}
              />
              <Input
                type="number"
                label="Normal working week (hours)"
                name="financialInfo.overtime.normalWorkingWeekHours"
                value={fi.overtime.normalWorkingWeekHours}
                onChange={handleChange}
                min={0}
                step={0.5}
              />
              <Input
                type="number"
                label="Or: fixed overtime pay per month (£)"
                name="financialInfo.overtime.cashAmountPerMonth"
                value={fi.overtime.cashAmountPerMonth || ""}
                onChange={handleChange}
                min={0}
                hint="Use this instead of hours if easier"
              />
            </div>
          </Section>

          <Section title="Childcare vouchers">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                type="number"
                label="Childcare vouchers per month (£)"
                name="financialInfo.childcare.monthlyVoucherValue"
                value={fi.childcare.monthlyVoucherValue || ""}
                onChange={handleChange}
                min={0}
              />
              <Input
                type="checkbox"
                label="Joined scheme before 6 April 2011"
                name="financialInfo.childcare.joinedBeforeApril2011"
                checked={fi.childcare.joinedBeforeApril2011}
                onChange={handleChange}
              />
            </div>
          </Section>

          <Section title="Salary sacrifice (excluding pension)">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                type="number"
                label="NI-only sacrifice (£)"
                name="financialInfo.salarySacrifice.niOnlyAmount"
                value={fi.salarySacrifice.niOnlyAmount || ""}
                onChange={handleChange}
                min={0}
              />
              <Select
                label="NI-only frequency"
                name="financialInfo.salarySacrifice.niOnlyFrequency"
                value={fi.salarySacrifice.niOnlyFrequency}
                onChange={handleChange}
                options={SACRIFICE_FREQUENCY_OPTIONS}
              />
              <Input
                type="number"
                label="Tax-exempt sacrifice (£)"
                name="financialInfo.salarySacrifice.taxExemptAmount"
                value={fi.salarySacrifice.taxExemptAmount || ""}
                onChange={handleChange}
                min={0}
              />
              <Select
                label="Tax-exempt frequency"
                name="financialInfo.salarySacrifice.taxExemptFrequency"
                value={fi.salarySacrifice.taxExemptFrequency}
                onChange={handleChange}
                options={SACRIFICE_FREQUENCY_OPTIONS}
              />
            </div>
          </Section>

          <Section title="Taxable benefits">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                type="number"
                label="Benefits in kind (£)"
                name="financialInfo.taxableBenefits.benefitsAmount"
                value={fi.taxableBenefits.benefitsAmount || ""}
                onChange={handleChange}
                min={0}
              />
              <Select
                label="Benefits frequency"
                name="financialInfo.taxableBenefits.benefitsFrequency"
                value={fi.taxableBenefits.benefitsFrequency}
                onChange={handleChange}
                options={SACRIFICE_FREQUENCY_OPTIONS}
              />
              <Input
                type="number"
                label="Cash allowances (£)"
                name="financialInfo.taxableBenefits.cashAllowancesAmount"
                value={fi.taxableBenefits.cashAllowancesAmount || ""}
                onChange={handleChange}
                min={0}
              />
              <Select
                label="Cash allowances frequency"
                name="financialInfo.taxableBenefits.cashAllowancesFrequency"
                value={fi.taxableBenefits.cashAllowancesFrequency}
                onChange={handleChange}
                options={SACRIFICE_FREQUENCY_OPTIONS}
              />
            </div>
          </Section>

          <Section title="Other options">
            <div className="space-y-3 mb-4">
              <Input
                type="checkbox"
                label="Do not pay National Insurance"
                name="financialInfo.additionalOptions.noNationalInsurance"
                checked={fi.additionalOptions.noNationalInsurance}
                onChange={handleChange}
                hint="e.g. over State Pension age"
              />
              <Input
                type="checkbox"
                label="Blind person's allowance"
                name="financialInfo.additionalOptions.blindPersonsAllowance"
                checked={fi.additionalOptions.blindPersonsAllowance}
                onChange={handleChange}
              />
              <Input
                type="checkbox"
                label="Married — one of you born before 6 April 1935"
                name="financialInfo.additionalOptions.marriedBornBefore6April1935"
                checked={fi.additionalOptions.marriedBornBefore6April1935}
                onChange={handleChange}
              />
            </div>
            <Select
              label="Days worked per week"
              name="financialInfo.additionalOptions.daysPerWeekWorked"
              value={fi.additionalOptions.daysPerWeekWorked}
              onChange={handleChange}
              options={[1, 2, 3, 4, 5, 6, 7].map((d) => ({
                value: d,
                label: String(d),
              }))}
              hint="Affects the daily column in take-home breakdowns"
            />
          </Section>

          <details className="rounded-lg border border-ink-200">
            <summary className="cursor-pointer px-4 py-3 text-sm font-medium text-ink-800">
              Preview calculation payload
            </summary>
            <pre className="overflow-x-auto px-4 pb-4 text-xs text-ink-600">
              {JSON.stringify(formData, null, 2)}
            </pre>
          </details>

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded bg-ledger-600 py-3 text-white hover:bg-ledger-700 disabled:opacity-60"
          >
            {submitting ? "Saving…" : "Save & continue"}
          </button>
        </form>
      </div>
    </div>
  );
}
