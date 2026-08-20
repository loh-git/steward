import type {
  FinancialInfo,
  SalarySacrificeFrequency,
  TaxYear,
} from "@/types/financialProfile";
import type { TakeHomeResult, TakeHomeDeductions } from "@/types/takeHome";
import type { SalaryChange } from "@/types/salaryHistory";
import { TAX_YEAR_CONFIG, TAX_YEAR_ORDER } from "./constants";
import { monthIndex } from "@/utils/monthly/merge-recurring";



export function frequencyToAnnual(
  amount: number,
  frequency: SalarySacrificeFrequency,
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

export function getAdjustedPayDateForMonth(
  year: number,
  month: number,
  dayOfMonth: number | null | undefined,
): Date | null {
  if (dayOfMonth == null) return null;

  const safeDay = Math.min(dayOfMonth, new Date(year, month, 0).getDate());
  const candidate = new Date(year, month - 1, safeDay);

  if (candidate.getMonth() !== month - 1) {
    return null;
  }

  // TODO: when dayOfMonth is very early (1st/2nd) and lands on a weekend, shifting
  // back 1-2 days here can roll the result into the previous calendar month, even
  // though this function is meant to return a date "for [this] month". Confirm
  // whether that's the intended payroll behaviour or an edge-case bug.
  if (candidate.getDay() === 0) {
    candidate.setDate(candidate.getDate() - 2);
  } else if (candidate.getDay() === 6) {
    candidate.setDate(candidate.getDate() - 1);
  }

  return candidate;
}

/**
 * Maps a calendar month to the UK tax year it actually falls in (6 Apr–5 Apr),
 * clamped to the nearest end of TAX_YEAR_ORDER when the real tax year isn't in
 * our data yet (e.g. a future year constants.ts hasn't been updated for).
 */
export function resolveTaxYearForCalendarMonth(year: number, month: number): TaxYear {
  const startYear = month <= 3 ? year - 1 : year;
  const label = `${startYear}/${String(startYear + 1).slice(-2)}` as TaxYear;
  const index = TAX_YEAR_ORDER.indexOf(label);
  if (index === -1) {
    return startYear < Number(TAX_YEAR_ORDER[0].slice(0, 4))
      ? TAX_YEAR_ORDER[0]
      : TAX_YEAR_ORDER[TAX_YEAR_ORDER.length - 1];
  }
  return label;
}

/** Closed-window predicate for salary_changes rows. Deliberately not appliesToMonth's
 * convention: a null effectiveFrom means "no lower bound", never a createdAt fallback. */
function withinSalaryChangeWindow(
  change: Pick<
    SalaryChange,
    "effectiveFromYear" | "effectiveFromMonth" | "endsUntilYear" | "endsUntilMonth"
  >,
  year: number,
  month: number,
): boolean {
  const target = monthIndex(year, month);
  const start =
    change.effectiveFromYear != null && change.effectiveFromMonth != null
      ? monthIndex(change.effectiveFromYear, change.effectiveFromMonth)
      : -Infinity;
  if (target < start) return false;
  return target <= monthIndex(change.endsUntilYear, change.endsUntilMonth);
}

/** Resolves annualIncome/taxCode/pension for a given calendar month: a matching
 * salary_changes window if one covers it, otherwise the live profile values. */
export function resolveSalaryForMonth(
  fi: FinancialInfo,
  salaryChanges: SalaryChange[],
  year: number,
  month: number,
): Pick<FinancialInfo, "annualIncome" | "taxCode" | "pension"> {
  // Windows shouldn't overlap by construction, but if data is ever malformed,
  // prefer whichever candidate ended most recently (closest to "now").
  const candidates = salaryChanges
    .filter((c) => withinSalaryChangeWindow(c, year, month))
    .sort(
      (a, b) =>
        monthIndex(b.endsUntilYear, b.endsUntilMonth) -
        monthIndex(a.endsUntilYear, a.endsUntilMonth),
    );
  const match = candidates[0];
  if (!match) {
    return { annualIncome: fi.annualIncome, taxCode: fi.taxCode, pension: fi.pension };
  }
  return { annualIncome: match.annualIncome, taxCode: match.taxCode, pension: match.pension };
}

/** calculateTakeHome, but using the tax year and (if salary history is passed) the
 * annualIncome/taxCode/pension that actually applied to the given calendar month,
 * rather than blindly trusting whatever's currently stored on the profile. */
export function calculateTakeHomeForMonth(
  fi: FinancialInfo,
  year: number,
  month: number,
  salaryChanges: SalaryChange[] = [],
): TakeHomeResult {
  const resolvedSalary = resolveSalaryForMonth(fi, salaryChanges, year, month);
  return calculateTakeHome({
    ...fi,
    ...resolvedSalary,
    taxYear: resolveTaxYearForCalendarMonth(year, month),
  });
}

function parsePersonalAllowance(taxCode: string, defaultAllowance: number): number {
  const trimmed = taxCode.trim().toUpperCase();
  if (!trimmed) return defaultAllowance;

  // Flat-rate codes carry no free-pay allowance at all — everything is taxed.
  // We approximate this as a zero allowance rather than modelling separate flat-rate
  // bands, in keeping with this calculator's ballpark level of precision elsewhere.
  if (trimmed === "BR" || trimmed === "D0" || trimmed === "D1") return 0;

  // K-codes represent a NEGATIVE allowance: untaxed income/benefits HMRC wants to
  // recover extra tax on, added to taxable pay rather than subtracted from it.
  // Returning a negative number here works because calculateIncomeTax does
  // `taxableIncome - allowance`, so a negative allowance increases taxable income.
  const kMatch = trimmed.match(/^K(\d+)/);
  if (kMatch) return -(Number(kMatch[1]) * 10);

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

function calculatePensionAnnual(
  fi: FinancialInfo,
  pensionableGrossAnnual: number,
): number {
  const { pension } = fi;
  if (pension.value <= 0) return 0;

  let pensionable = pensionableGrossAnnual;
  if (pension.scheme === "auto-enrolment" || pension.basedOnQualifyingEarnings) {
    const { lower, upper } = TAX_YEAR_CONFIG[fi.taxYear].pensionQualifying;
    pensionable = Math.min(Math.max(pensionableGrossAnnual - lower, 0), upper - lower);
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

/**
 * @description The work-horse function for calculating the take-home pay for a user.
 * @param fi Financial information including annual income, tax code, pension, student loans, salary sacrifice, taxable benefits, overtime, bonus, and additional options.
 * @returns An object containing the gross annual, gross monthly, deductions, total deductions annual, net annual, net monthly, and whether the user has income.
 */
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

  // Only fold bonus/overtime/cash allowances into pensionable pay if the user has
  // explicitly opted each one in — otherwise pension contributions are based on
  // base salary alone.
  const pensionableGrossAnnual =
    baseSalary +
    (fi.pension.includeBonus ? bonusAnnual : 0) +
    (fi.pension.includeOvertime ? overtimeAnnual : 0) +
    (fi.pension.includeCashAllowances ? cashAllowances : 0);

  const pensionAnnual = calculatePensionAnnual(fi, pensionableGrossAnnual);
  const pensionReducesTaxAndNI =
    fi.pension.scheme === "salary-sacrifice" || fi.pension.scheme === "auto-enrolment";

  let incomeForTax = grossAnnual - taxExemptSacrifice - childcareAnnual;
  let incomeForNI = grossAnnual - taxExemptSacrifice - niOnlySacrifice;

  // Only salary-sacrifice/auto-enrolment pensions reduce pay before tax and NI are
  // worked out — "employer"/"personal" pensions come out of already-taxed-and-NI'd
  // net pay, so they must NOT reduce incomeForNI (see totalDeductionsAnnual below,
  // where pensionAnnual is still deducted from net pay for those schemes instead).
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

  // TODO: verify whether Blind Person's Allowance should be excluded from the
  // >£100k taper below — HMRC's income-related reduction is meant to apply to the
  // personal allowance only, not BPA, but here they're combined before tapering.
  //
  // allowance > 0 guard: K-code allowances are intentionally negative (see
  // parsePersonalAllowance above), and this taper math only makes sense for a
  // positive allowance being reduced, not a negative one being adjusted.
  if (incomeForTax > 100_000 && allowance > 0) {
    const taper = Math.min((incomeForTax - 100_000) / 2, allowance);
    allowance = Math.max(allowance - taper, 0);
  }

  // NT ("No Tax") codes mean no income tax is due at all, which isn't something an
  // allowance figure alone can express (a high enough income would still be taxable
  // even with a very large allowance), so it's handled as its own case here.
  const isNoTaxCode = fi.taxCode.trim().toUpperCase() === "NT";
  const incomeTax = isNoTaxCode
    ? 0
    : calculateIncomeTax(incomeForTax, allowance, fi.residentInScotland, config);

  const nationalInsurance = calculateNI(
    incomeForNI,
    config,
    fi.additionalOptions.noNationalInsurance,
  );

  const repaymentIncome = grossAnnual - pensionAnnual;
  const studentLoan = calculateStudentLoans(repaymentIncome, fi, config);

  const deductions: TakeHomeDeductions = {
    incomeTax: incomeTax,
    nationalInsurance: nationalInsurance,
    pension: pensionReducesTaxAndNI ? 0 : pensionAnnual,
    studentLoan: studentLoan,
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
    grossAnnual: grossAnnual,
    grossMonthly: grossAnnual / 12,
    deductions: {
      ...deductions,
      pension: pensionDeductedFromNet,
    },
    totalDeductionsAnnual: totalDeductionsAnnual,
    netAnnual: netAnnual,
    netMonthly: netAnnual / 12,
    hasIncome: true,
  };
}

// Simple function to format a number as a GBP string

