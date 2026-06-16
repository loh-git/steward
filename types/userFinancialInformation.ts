export type {
  FinancialProfilePayload,
  FinancialInfo,
  TaxYear,
  PayFrequency,
} from "@/app/setup/types";

export type { TakeHomeResult } from "@/lib/take-home/calculate";

/** Payload consumed by take-home pay calculation (dashboard / API). */
export type CalculationInput = import("@/app/setup/types").FinancialProfilePayload;
