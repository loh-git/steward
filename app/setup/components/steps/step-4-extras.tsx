import Section from "@/app/setup/components/section";
import Input from "@/app/setup/components/input";
import Select from "@/app/setup/components/select";
import type { PayFrequency, SalarySacrificeFrequency } from "@/types/financialProfile";
import type { WizardStepProps } from "./types";

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

export default function Step4Extras({ fi, handleChange }: WizardStepProps) {
  return (
    <div className="space-y-6">
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
    </div>
  );
}
