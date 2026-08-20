import type { TaxYear } from "@/types/financialProfile";

/** HMRC-style figures  */
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
    plan2: 28_470,
    plan4Scotland: 32_745,
    plan5: 25_000,
    postgraduate: 21_000,
    rate: 0.09,
    postgradRate: 0.06,
  },
};

/** 2026/27 — confirmed published figures (Autumn Budget 2025, Scottish Budget Jan 2026,
 * DWP auto-enrolment review Dec 2025). Personal allowance, rUK bands, NI, and pension
 * qualifying earnings are frozen at 2025/26 levels; Scotland's starter/basic bands and
 * all student loan thresholds have moved. */
const CONFIG_2026_27: TaxYearConfig = {
  personalAllowance: 12_570,
  blindPersonsAllowance: 3_250,
  rUkBands: [
    { upTo: 37_700, rate: 0.2 },
    { upTo: 112_570, rate: 0.4 },
    { upTo: BAND_INFINITY, rate: 0.45 },
  ],
  scotlandBands: [
    { upTo: 3_967, rate: 0.19 },
    { upTo: 16_956, rate: 0.2 },
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
    plan1: 26_900,
    plan2: 29_385,
    plan4Scotland: 33_795,
    plan5: 25_000,
    postgraduate: 21_000,
    rate: 0.09,
    postgradRate: 0.06,
  },
};

export const TAX_YEAR_CONFIG: Record<TaxYear, TaxYearConfig> = {
  "2024/25": CONFIG_2024_25,
  "2025/26": CONFIG_2025_26,
  "2026/27": CONFIG_2026_27,
};

/** Chronological order of known tax years — used to clamp a resolved calendar
 * month to the nearest available config when it falls outside our data. */
export const TAX_YEAR_ORDER: TaxYear[] = ["2024/25", "2025/26", "2026/27"];
