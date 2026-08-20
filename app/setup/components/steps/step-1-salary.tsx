import Section from "@/app/setup/components/section";
import Input from "@/app/setup/components/input";
import Select from "@/app/setup/components/select";
import type { TaxYear } from "@/types/financialProfile";
import type { WizardStepProps } from "./types";

const TAX_YEAR_OPTIONS: { value: TaxYear; label: string }[] = [
  { value: "2024/25", label: "2024 / 25" },
  { value: "2025/26", label: "2025 / 26" },
  { value: "2026/27", label: "2026 / 27" },
];

export default function Step1Salary({
  formData,
  fi,
  handleChange,
  handlePayDateChange,
  payDateError,
}: WizardStepProps) {
  return (
    <div className="space-y-6">
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
            <p className="text-sm text-ledger-600">{payDateError}</p>
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
    </div>
  );
}
