"use client";

import { useState, useId, useMemo } from "react";
import { AnimatePresence, motion } from "motion/react";

import StepIndicator from "@/app/setup/components/step-indicator";
import { WIZARD_STEPS } from "@/app/setup/components/steps";
import { saveFinancialProfile } from "./actions";
import { calculateTakeHome } from "@/utils/take-home/calculate";
import { isNextRedirectError } from "@/utils/isNextRedirectError";
import { type FinancialProfilePayload } from "@/types/financialProfile";
import {
  applyFieldUpdate,
  createInitialPayload,
  parseInputValue,
} from "./utils";

const LAST_STEP_INDEX = WIZARD_STEPS.length - 1;

const stepVariants = {
  enter: (direction: number) => ({ x: direction >= 0 ? 48 : -48, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (direction: number) => ({ x: direction >= 0 ? -48 : 48, opacity: 0 }),
};

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
  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState(0);

  const fi = {
    ...formData.financialInfo,
    payDate: formData.financialInfo.payDate ?? { dayOfMonth: null },
  };
  const takeHome = useMemo(() => calculateTakeHome(fi), [fi]);

  const isForwardBlocked = currentStep === 0 && Boolean(payDateError);

  const goToStep = (target: number) => {
    if (target === currentStep || target < 0 || target > LAST_STEP_INDEX)
      return;
    if (isForwardBlocked && target > currentStep) return;
    setDirection(target > currentStep ? 1 : -1);
    setCurrentStep(target);
  };

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
    if (currentStep !== LAST_STEP_INDEX) return;
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
      // saveFinancialProfile redirects on success, which Next.js implements by
      // throwing — that's not a real failure, let it propagate so the
      // navigation actually happens instead of showing a false error.
      if (isNextRedirectError(err)) throw err;
      setSubmitting(false);
      setError(
        err instanceof Error ? err.message : "Failed to save your profile",
      );
    }
  };

  const ActiveStep = WIZARD_STEPS[currentStep];
  const stepProps = {
    formData,
    fi,
    handleChange,
    handlePayDateChange,
    payDateError,
    takeHome,
    submitting,
    error,
  };

  return (
    <div className="min-h-screen bg-paper-canvas p-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="mb-2 font-display text-3xl font-bold text-ink-900">
          Financial Profile Setup
        </h1>
        <p className="mb-1 text-ink-600">
          Welcome to Steward. Tell us about your pay so we can estimate your
          monthly take-home.
        </p>
        <p className="mb-8 text-ink-600">
          Fields mirror UK income tax, National Insurance, pension, and student
          loan inputs for the selected tax year. Your profile is saved to your
          account when you continue.
        </p>

        <StepIndicator
          steps={WIZARD_STEPS.map(({ id, title }) => ({ id, title }))}
          currentStep={currentStep}
          onStepClick={goToStep}
          isForwardBlocked={isForwardBlocked}
        />

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="overflow-hidden">
            <AnimatePresence mode="wait" custom={direction} initial={false}>
              <motion.div
                key={ActiveStep.id}
                custom={direction}
                variants={stepVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.25, ease: "easeInOut" }}
              >
                <ActiveStep.Component {...stepProps} />
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="flex items-center justify-between pt-2">
            {currentStep > 0 ? (
              <button
                type="button"
                onClick={() => goToStep(currentStep - 1)}
                disabled={submitting}
                className="rounded border border-ink-300 px-4 py-2 text-ink-700 hover:bg-ink-50 disabled:opacity-60"
              >
                Back
              </button>
            ) : (
              <span />
            )}
            {currentStep < LAST_STEP_INDEX ? (
              <button
                type="button"
                onClick={() => goToStep(currentStep + 1)}
                disabled={isForwardBlocked}
                className="rounded bg-ledger-600 px-6 py-2 text-white hover:bg-ledger-700 disabled:opacity-60"
              >
                Next
              </button>
            ) : null}
          </div>
        </form>
      </div>
    </div>
  );
}
