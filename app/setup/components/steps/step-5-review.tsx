"use client";

import { motion } from "motion/react";
import Section from "@/app/setup/components/section";
import Input from "@/app/setup/components/input";
import Select from "@/app/setup/components/select";
import TakeHomeSummary from "@/app/setup/components/take-home-summary";
import type { WizardStepProps } from "./types";

export default function Step5Review({
  fi,
  handleChange,
  takeHome,
  submitting,
  error,
  formData,
}: WizardStepProps) {
  return (
    <div className="space-y-6">
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

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut", delay: 0.1 }}
      >
        <TakeHomeSummary
          result={takeHome}
          taxYear={fi.taxYear}
          regionLabel={
            fi.residentInScotland
              ? "Scotland"
              : "England, Wales & Northern Ireland"
          }
        />
      </motion.div>

      {error ? (
        <p className="rounded border border-ledger-300 bg-ledger-50 px-4 py-2 text-sm text-ledger-800">
          {error}
        </p>
      ) : null}

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
    </div>
  );
}
