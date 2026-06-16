import type { FinancialInfo, SacrificeFrequency } from "@/app/setup/types";
import { TAX_YEAR_CONFIG } from "./constants";

export type TakeHomeDeductions = {
  incomeTax: number;
  nationalInsurance: number;
  pension: number;
  studentLoan: number;
};

export type TakeHomeResult = {
  grossAnnual: number;
  grossMonthly: number;
  deductions: TakeHomeDeductions;
  totalDeductionsAnnual: number;
  netAnnual: number;
  netMonthly: number;
  /** True when annual gross salary is zero — estimates hidden. */
  hasIncome: boolean;
};

export function frequencyToAnnual(
  amount: number,
  frequency: SacrificeFrequency,
): number {
  if (amount <= 0) return 0;
  switch (frequency) {
    case "yearly":
      return amount;
    case "monthly":
      return amount * 12;
    case "weekly":
      return amount * 52;
    default:
      return amount;
  }
}

function parsePersonalAllowance(taxCode: string, defaultAllowance: number): number {
  const trimmed = taxCode.trim().toUpperCase();
  if (!trimmed) return defaultAllowance;
  const match = trimmed.match(/^(\d+)/);
  if (!match) return defaultAllowance;
  return Number(match[1]) * 10;
}

function taxOnBands(taxable: number, bands: { upTo: number; rate: number }[]): number {
  if (taxable <= 0) return 0;
  let tax = 0;
  let previous = 0;
  for (const band of bands) {
    const bandWidth = band.upTo - previous;
    const inBand = Math.min(Math.max(taxable - previous, 0), bandWidth);
    tax += inBand * band.rate;
    previous = band.upTo;
    if (taxable <= band.upTo) break;
  }
  return tax;
}

function calculateIncomeTax(
  taxableIncome: number,
  allowance: number,
  scotland: boolean,
  config: (typeof TAX_YEAR_CONFIG)["2026/27"],
): number {
  const afterAllowance = Math.max(taxableIncome - allowance, 0);
  const bands = scotland ? config.scotlandBands : config.rUkBands;
  return taxOnBands(afterAllowance, bands);
}

function calculateNI(
  niablePay: number,
  config: (typeof TAX_YEAR_CONFIG)["2026/27"],
  noNI: boolean,
): number {
  if (noNI || niablePay <= 0) return 0;
  const { primaryThreshold, upperEarningsLimit, mainRate, upperRate } = config.ni;
  const mainBand = Math.min(
    Math.max(niablePay - primaryThreshold, 0),
    upperEarningsLimit - primaryThreshold,
  );
  const upperBand = Math.max(niablePay - upperEarningsLimit, 0);
  return mainBand * mainRate + upperBand * upperRate;
}

function calculateStudentLoans(
  repaymentIncome: number,
  fi: FinancialInfo,
  config: (typeof TAX_YEAR_CONFIG)["2026/27"],
): number {
  const { studentLoans } = config;
  const { studentLoanPlan: plans } = fi;
  let total = 0;

  const planThresholds: { active: boolean; threshold: number; rate: number }[] = [
    { active: plans.plan1, threshold: studentLoans.plan1, rate: studentLoans.rate },
    { active: plans.plan2, threshold: studentLoans.plan2, rate: studentLoans.rate },
    {
      active: plans.plan4Scotland,
      threshold: studentLoans.plan4Scotland,
      rate: studentLoans.rate,
    },
    { active: plans.plan5, threshold: studentLoans.plan5, rate: studentLoans.rate },
    {
      active: plans.postgraduate,
      threshold: studentLoans.postgraduate,
      rate: studentLoans.postgradRate,
    },
  ];

  for (const plan of planThresholds) {
    if (!plan.active) continue;
    total += Math.max(repaymentIncome - plan.threshold, 0) * plan.rate;
  }

  return total;
}

function calculatePensionAnnual(fi: FinancialInfo, grossAnnual: number): number {
  const { pension } = fi;
  if (pension.value <= 0) return 0;

  let pensionable = grossAnnual;
  if (pension.scheme === "auto-enrolment" || pension.basedOnQualifyingEarnings) {
    const { lower, upper } = TAX_YEAR_CONFIG[fi.taxYear].pensionQualifying;
    pensionable = Math.min(Math.max(grossAnnual - lower, 0), upper - lower);
  }

  if (pension.type === "percentage") {
    return pensionable * (pension.value / 100);
  }
  return pension.value * 12;
}

function annualOvertime(fi: FinancialInfo, baseAnnual: number): number {
  if (fi.overtime.cashAmountPerMonth > 0) {
    return fi.overtime.cashAmountPerMonth * 12;
  }
  const weekHours = fi.overtime.normalWorkingWeekHours || 37.5;
  if (weekHours <= 0) return 0;
  const hourly = baseAnnual / (weekHours * 52);
  const band1 =
    fi.overtime.hoursPerMonth * 12 * hourly * fi.overtime.rateMultiplier;
  const band2 =
    fi.overtime.hoursPerMonthSecond *
    12 *
    hourly *
    fi.overtime.rateMultiplierSecond;
  return band1 + band2;
}

export function calculateTakeHome(fi: FinancialInfo): TakeHomeResult {
  const config = TAX_YEAR_CONFIG[fi.taxYear];
  const baseSalary = fi.annualIncome;

  if (baseSalary <= 0) {
    return {
      grossAnnual: 0,
      grossMonthly: 0,
      deductions: {
        incomeTax: 0,
        nationalInsurance: 0,
        pension: 0,
        studentLoan: 0,
      },
      totalDeductionsAnnual: 0,
      netAnnual: 0,
      netMonthly: 0,
      hasIncome: false,
    };
  }

  const cashAllowances = frequencyToAnnual(
    fi.taxableBenefits.cashAllowancesAmount,
    fi.taxableBenefits.cashAllowancesFrequency,
  );
  const benefitsInKind = frequencyToAnnual(
    fi.taxableBenefits.benefitsAmount,
    fi.taxableBenefits.benefitsFrequency,
  );
  const overtimeAnnual = annualOvertime(fi, baseSalary);
  const bonusAnnual = fi.bonus.amount;

  const grossAnnual =
    baseSalary + bonusAnnual + overtimeAnnual + cashAllowances;

  const taxExemptSacrifice = frequencyToAnnual(
    fi.salarySacrifice.taxExemptAmount,
    fi.salarySacrifice.taxExemptFrequency,
  );
  const niOnlySacrifice = frequencyToAnnual(
    fi.salarySacrifice.niOnlyAmount,
    fi.salarySacrifice.niOnlyFrequency,
  );
  const childcareAnnual = fi.childcare.monthlyVoucherValue * 12;

  const pensionAnnual = calculatePensionAnnual(fi, grossAnnual);
  const pensionReducesTaxAndNI =
    fi.pension.scheme === "salary-sacrifice" || fi.pension.scheme === "auto-enrolment";

  let incomeForTax = grossAnnual - taxExemptSacrifice - childcareAnnual;
  let incomeForNI = grossAnnual - taxExemptSacrifice - niOnlySacrifice;

  if (pensionReducesTaxAndNI) {
    incomeForTax -= pensionAnnual;
    incomeForNI -= pensionAnnual;
  }

  incomeForTax += benefitsInKind;

  let allowance = parsePersonalAllowance(
    fi.taxCode,
    config.personalAllowance,
  );
  if (fi.additionalOptions.blindPersonsAllowance) {
    allowance += config.blindPersonsAllowance;
  }

  if (incomeForTax > 100_000) {
    const taper = Math.min((incomeForTax - 100_000) / 2, allowance);
    allowance = Math.max(allowance - taper, 0);
  }

  const incomeTax = calculateIncomeTax(
    incomeForTax,
    allowance,
    fi.residentInScotland,
    config,
  );

  if (!pensionReducesTaxAndNI) {
    incomeForNI -= pensionAnnual;
  }

  const nationalInsurance = calculateNI(
    incomeForNI,
    config,
    fi.additionalOptions.noNationalInsurance,
  );

  const repaymentIncome = grossAnnual - pensionAnnual;
  const studentLoan = calculateStudentLoans(repaymentIncome, fi, config);

  const deductions: TakeHomeDeductions = {
    incomeTax: round2(incomeTax),
    nationalInsurance: round2(nationalInsurance),
    pension: round2(pensionReducesTaxAndNI ? 0 : pensionAnnual),
    studentLoan: round2(studentLoan),
  };

  const pensionDeductedFromNet = pensionReducesTaxAndNI
    ? pensionAnnual
    : deductions.pension;
  const totalDeductionsAnnual =
    deductions.incomeTax +
    deductions.nationalInsurance +
    deductions.studentLoan +
    pensionDeductedFromNet;

  const netAnnual = Math.max(grossAnnual - totalDeductionsAnnual, 0);

  return {
    grossAnnual: round2(grossAnnual),
    grossMonthly: round2(grossAnnual / 12),
    deductions: {
      ...deductions,
      pension: round2(pensionDeductedFromNet),
    },
    totalDeductionsAnnual: round2(totalDeductionsAnnual),
    netAnnual: round2(netAnnual),
    netMonthly: round2(netAnnual / 12),
    hasIncome: true,
  };
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

export function formatGBP(amount: number): string {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}
