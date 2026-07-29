// TO CLARIFY:
// - FINANCIAL PROFILE = USER'S FINANCIAL INFORMATION TIED TO THEIR USER ACCOUNT
// - FINANCIAL INFORMATION = USER'S FINANCIAL INFORMATION (E.G. SALARY, PENSION, STUDENT LOAN, ETC.)

// ==== FINANCIAL PROFILE INPUT TYPES ====

// Tax year choices
export type TaxYear = "2024/25" | "2025/26" | "2026/27";

// Pay frequency choices
export type PayFrequency =
  | "yearly"
  | "monthly"
  | "four-weekly"
  | "two-weekly"
  | "weekly";

// Salary sacrifice frequency choices
export type SalarySacrificeFrequency = "yearly" | "monthly" | "weekly";

// Student loan plan choices
export type StudentLoanPlan = {
  plan1: boolean;
  plan2: boolean;
  plan4Scotland: boolean;
  plan5: boolean;
  postgraduate: boolean;
};

// Pension scheme choices
export type PensionScheme =
  | "auto-enrolment"
  | "employer"
  | "salary-sacrifice"
  | "personal";

// Pension contribution details
export type PensionContribution = {
  type: "percentage" | "amount";
  value: number;
  scheme: PensionScheme;
  basedOnQualifyingEarnings: boolean;
  includeOvertime: boolean;
  includeBonus: boolean;
  includeCashAllowances: boolean;
};

// ==== FINANCIAL INFORMATION & PAYLOAD TYPES ====

// Financial information included in user's financial profile payload
export type FinancialInfo = {
  annualIncome: number;
  payDate: {
    dayOfMonth: number | null;
  };
  taxYear: TaxYear;
  residentInScotland: boolean;
  taxCode: string;
  studentLoanPlan: StudentLoanPlan;
  pension: PensionContribution;
  bonus: {
    amount: number;
    normalPayPeriod: PayFrequency;
  };
  overtime: {
    hoursPerMonth: number;
    rateMultiplier: number;
    hoursPerMonthSecond: number;
    rateMultiplierSecond: number;
    normalWorkingWeekHours: number;
    cashAmountPerMonth: number;
  };
  childcare: {
    monthlyVoucherValue: number;
    joinedBeforeApril2011: boolean;
  };
  salarySacrifice: {
    niOnlyAmount: number;
    niOnlyFrequency: SalarySacrificeFrequency;
    taxExemptAmount: number;
    taxExemptFrequency: SalarySacrificeFrequency;
  };
  taxableBenefits: {
    benefitsAmount: number;
    benefitsFrequency: SalarySacrificeFrequency;
    cashAllowancesAmount: number;
    cashAllowancesFrequency: SalarySacrificeFrequency;
  };
  additionalOptions: {
    noNationalInsurance: boolean;
    blindPersonsAllowance: boolean;
    marriedBornBefore6April1935: boolean;
    daysPerWeekWorked: 1 | 2 | 3 | 4 | 5 | 6 | 7;
  };
};

// Financial profile payload to be sent to BE
// ID, user information, and financial information
export type FinancialProfilePayload = {
  id: string;
  userInfo: {
    firstName: string;
    lastName: string;
    dob: string;
    age: number;
  };
  financialInfo: FinancialInfo;
};


// Payload consumed by take-home pay calculation (dashboard / API).
// I don't think we need this anymore, as we're using the TakeHomeResult type instead.
// export type CalculationInput = FinancialProfilePayload;
