import type { TaxYear } from "@/app/setup/types";

/** HMRC-style figures aligned with The Salary Calculator defaults. */
export type TaxYearConfig = {
  personalAllowance: number;
  blindPersonsAllowance: number;
  /** England, Wales & Northern Ireland income tax bands (above personal allowance). */
  rUkBands: { upTo: number; rate: number }[];
  /** Scottish income tax bands (above personal allowance). */
  scotlandBands: { upTo: number; rate: number }[];
  ni: {
    primaryThreshold: number;
    upperEarningsLimit: number;
    mainRate: number;
    upperRate: number;
  };
  pensionQualifying: { lower: number; upper: number };
  studentLoans: {
    plan1: number;
    plan2: number;
    plan4Scotland: number;
    plan5: number;
    postgraduate: number;
    rate: number;
    postgradRate: number;
  };
};

const BAND_INFINITY = Number.POSITIVE_INFINITY;

/** 2024/25 — employee NI still 12% until 6 Jan 2025 in that year; we use post-cut rates for simplicity. */
const CONFIG_2024_25: TaxYearConfig = {
  personalAllowance: 12_570,
  blindPersonsAllowance: 3_070,
  rUkBands: [
    { upTo: 37_700, rate: 0.2 },
    { upTo: 112_570, rate: 0.4 },
    { upTo: BAND_INFINITY, rate: 0.45 },
  ],
  scotlandBands: [
    { upTo: 2_306, rate: 0.19 },
    { upTo: 11_685, rate: 0.2 },
    { upTo: 17_101, rate: 0.21 },
    { upTo: 31_092, rate: 0.42 },
    { upTo: 62_430, rate: 0.45 },
    { upTo: BAND_INFINITY, rate: 0.48 },
  ],
  ni: {
    primaryThreshold: 12_570,
    upperEarningsLimit: 50_270,
    mainRate: 0.08,
    upperRate: 0.02,
  },
  pensionQualifying: { lower: 6_240, upper: 50_270 },
  studentLoans: {
    plan1: 22_015,
    plan2: 27_295,
    plan4Scotland: 31_395,
    plan5: 25_000,
    postgraduate: 21_000,
    rate: 0.09,
    postgradRate: 0.06,
  },
};

const CONFIG_2025_26: TaxYearConfig = {
  personalAllowance: 12_570,
  blindPersonsAllowance: 3_130,
  rUkBands: [
    { upTo: 37_700, rate: 0.2 },
    { upTo: 112_570, rate: 0.4 },
    { upTo: BAND_INFINITY, rate: 0.45 },
  ],
  scotlandBands: [
    { upTo: 2_827, rate: 0.19 },
    { upTo: 14_921, rate: 0.2 },
    { upTo: 31_092, rate: 0.21 },
    { upTo: 62_430, rate: 0.42 },
    { upTo: 112_570, rate: 0.45 },
    { upTo: BAND_INFINITY, rate: 0.48 },
  ],
  ni: {
    primaryThreshold: 12_570,
    upperEarningsLimit: 50_270,
    mainRate: 0.08,
    upperRate: 0.02,
  },
  pensionQualifying: { lower: 6_240, upper: 50_270 },
  studentLoans: {
    plan1: 26_065,
    plan2: 27_295,
    plan4Scotland: 32_745,
    plan5: 25_000,
    postgraduate: 21_000,
    rate: 0.09,
    postgradRate: 0.06,
  },
};

/** 2026/27 — projected/frozen bands (update when HMRC publishes). */
const CONFIG_2026_27: TaxYearConfig = {
  ...CONFIG_2025_26,
};

export const TAX_YEAR_CONFIG: Record<TaxYear, TaxYearConfig> = {
  "2024/25": CONFIG_2024_25,
  "2025/26": CONFIG_2025_26,
  "2026/27": CONFIG_2026_27,
};
