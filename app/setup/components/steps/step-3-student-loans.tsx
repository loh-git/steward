import Section from "@/app/setup/components/section";
import Input from "@/app/setup/components/input";
import type { WizardStepProps } from "./types";

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

export default function Step3StudentLoans({ fi, handleChange }: WizardStepProps) {
  return (
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
  );
}
