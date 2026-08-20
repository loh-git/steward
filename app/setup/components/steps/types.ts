import type { FinancialProfilePayload, FinancialInfo } from "@/types/financialProfile";
import type { TakeHomeResult } from "@/types/takeHome";

export type WizardStepProps = {
  formData: FinancialProfilePayload;
  fi: FinancialInfo;
  handleChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => void;
  handlePayDateChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  payDateError: string | null;
  takeHome: TakeHomeResult;
  submitting: boolean;
  error: string | null;
};
