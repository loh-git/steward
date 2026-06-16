export type TaxYear = "2024/25" | "2025/26" | "2026/27";

export type PayFrequency =
  | "yearly"
  | "monthly"
  | "four-weekly"
  | "two-weekly"
  | "weekly";

export type SacrificeFrequency = "yearly" | "monthly" | "weekly";

export type StudentLoanPlan = {
  plan1: boolean;
  plan2: boolean;
  plan4Scotland: boolean;
  plan5: boolean;
  postgraduate: boolean;
};

export type PensionScheme =
  | "auto-enrolment"
  | "employer"
  | "salary-sacrifice"
  | "personal";

export type PensionContribution = {
  type: "percentage" | "amount";
  value: number;
  scheme: PensionScheme;
  basedOnQualifyingEarnings: boolean;
  includeOvertime: boolean;
  includeBonus: boolean;
  includeCashAllowances: boolean;
};

export type FinancialInfo = {
  annualIncome: number;
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
    niOnlyFrequency: SacrificeFrequency;
    taxExemptAmount: number;
    taxExemptFrequency: SacrificeFrequency;
  };
  taxableBenefits: {
    benefitsAmount: number;
    benefitsFrequency: SacrificeFrequency;
    cashAllowancesAmount: number;
    cashAllowancesFrequency: SacrificeFrequency;
  };
  additionalOptions: {
    noNationalInsurance: boolean;
    blindPersonsAllowance: boolean;
    marriedBornBefore6April1935: boolean;
    daysPerWeekWorked: 1 | 2 | 3 | 4 | 5 | 6 | 7;
  };
};

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

export function createInitialPayload(id: string): FinancialProfilePayload {
  return {
    id,
    userInfo: {
      firstName: "",
      lastName: "",
      dob: "",
      age: 0,
    },
    financialInfo: {
      annualIncome: 0,
      taxYear: "2026/27",
      residentInScotland: false,
      taxCode: "",
      studentLoanPlan: {
        plan1: false,
        plan2: false,
        plan4Scotland: false,
        plan5: false,
        postgraduate: false,
      },
      pension: {
        type: "percentage",
        value: 0,
        scheme: "auto-enrolment",
        basedOnQualifyingEarnings: true,
        includeOvertime: false,
        includeBonus: false,
        includeCashAllowances: false,
      },
      bonus: {
        amount: 0,
        normalPayPeriod: "monthly",
      },
      overtime: {
        hoursPerMonth: 0,
        rateMultiplier: 1.5,
        hoursPerMonthSecond: 0,
        rateMultiplierSecond: 2,
        normalWorkingWeekHours: 37.5,
        cashAmountPerMonth: 0,
      },
      childcare: {
        monthlyVoucherValue: 0,
        joinedBeforeApril2011: false,
      },
      salarySacrifice: {
        niOnlyAmount: 0,
        niOnlyFrequency: "monthly",
        taxExemptAmount: 0,
        taxExemptFrequency: "monthly",
      },
      taxableBenefits: {
        benefitsAmount: 0,
        benefitsFrequency: "yearly",
        cashAllowancesAmount: 0,
        cashAllowancesFrequency: "yearly",
      },
      additionalOptions: {
        noNationalInsurance: false,
        blindPersonsAllowance: false,
        marriedBornBefore6April1935: false,
        daysPerWeekWorked: 5,
      },
    },
  };
}
