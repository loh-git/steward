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
    <ol className="mb-8 flex items-start gap-2">
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
              className="w-full text-left disabled:cursor-not-allowed disabled:opacity-50"
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
              <span
                className={`mt-2 block text-xs font-medium ${
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
  );
}
