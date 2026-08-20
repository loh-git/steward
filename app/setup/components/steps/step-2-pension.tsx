import Section from "@/app/setup/components/section";
import Input from "@/app/setup/components/input";
import Select from "@/app/setup/components/select";
import type { WizardStepProps } from "./types";

const PENSION_SCHEME_OPTIONS = [
  { value: "auto-enrolment", label: "Auto-enrolment" },
  { value: "employer", label: "Employer pension" },
  { value: "salary-sacrifice", label: "Salary sacrifice" },
  { value: "personal", label: "Personal pension" },
];

export default function Step2Pension({ fi, handleChange }: WizardStepProps) {
  return (
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
            tooltip="Only counts earnings between £6,240 and £50,270 a year, rather than your whole salary. This is the standard method for plain auto-enrolment schemes. Salary sacrifice, employer, and personal schemes more often use your full salary instead — check your payslip if you're unsure."
          />
          <Input
            type="checkbox"
            label="Include overtime in pensionable pay"
            name="financialInfo.pension.includeOvertime"
            checked={fi.pension.includeOvertime}
            onChange={handleChange}
            tooltip="Adds your overtime pay on top of your base salary when working out how much goes into your pension."
          />
          <Input
            type="checkbox"
            label="Include bonus in pensionable pay"
            name="financialInfo.pension.includeBonus"
            checked={fi.pension.includeBonus}
            onChange={handleChange}
            tooltip="Adds your annual bonus on top of your base salary when working out how much goes into your pension."
          />
          <Input
            type="checkbox"
            label="Include cash allowances in pensionable pay"
            name="financialInfo.pension.includeCashAllowances"
            checked={fi.pension.includeCashAllowances}
            onChange={handleChange}
            tooltip="Adds any taxable cash allowances (for example, a car allowance) on top of your base salary when working out how much goes into your pension."
          />
        </div>
      </div>
    </Section>
  );
}
