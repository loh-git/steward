"use client";

import { motion } from "motion/react";

export type WizardStepMeta = { id: string; title: string };

type StepIndicatorProps = {
  steps: WizardStepMeta[];
  currentStep: number;
  onStepClick: (index: number) => void;
  isForwardBlocked: boolean;
};

export default function StepIndicator({
  steps,
  currentStep,
  onStepClick,
  isForwardBlocked,
}: StepIndicatorProps) {
  return (
    <div className="mb-8">
      <ol className="flex items-start gap-2">
        {steps.map((step, index) => {
          const isActive = index === currentStep;
          const isComplete = index < currentStep;
          const disabled = isForwardBlocked && index > currentStep;
          return (
            <li key={step.id} className="flex-1">
              <button
                type="button"
                onClick={() => onStepClick(index)}
                disabled={disabled}
                aria-current={isActive ? "step" : undefined}
                aria-label={`Step ${index + 1}: ${step.title}`}
                // Full segment (bar + label) is a comfortable tap target on its
                // own from sm up; on phones the bar alone still needs enough
                // vertical reach, hence the extra padding there.
                className="w-full py-2 text-left disabled:cursor-not-allowed disabled:opacity-50 sm:py-0"
              >
                <span className="relative block h-2 rounded-full bg-ink-200 overflow-hidden">
                  {isComplete ? (
                    <span className="absolute inset-0 rounded-full bg-bottle-500" />
                  ) : null}
                  {isActive ? (
                    <motion.span
                      layoutId="active-step-highlight"
                      className="absolute inset-0 rounded-full bg-ledger-600"
                      transition={{ type: "spring", stiffness: 400, damping: 32 }}
                    />
                  ) : null}
                </span>
                {/* Five full titles ("Extra Income & Deductions") don't fit in
                  five equal columns on a phone screen — the per-segment label
                  only appears from sm up; phones get one line below instead. */}
                <span
                  className={`mt-2 hidden text-xs font-medium sm:block ${
                    isActive ? "text-ink-900" : "text-ink-500"
                  }`}
                >
                  {index + 1}. {step.title}
                </span>
              </button>
            </li>
          );
        })}
      </ol>
      <p className="mt-2 text-xs font-medium text-ink-700 sm:hidden">
        Step {currentStep + 1} of {steps.length}: {steps[currentStep].title}
      </p>
    </div>
  );
}
