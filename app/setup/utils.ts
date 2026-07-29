import type { FinancialProfilePayload } from "@/types/financialProfile";

function getAtPath(obj: object, path: string): unknown {
  return path.split(".").reduce<unknown>((acc, key) => {
    if (acc && typeof acc === "object" && key in acc) {
      return (acc as Record<string, unknown>)[key];
    }
    return undefined;
  }, obj);
}

function coerceValue(existing: unknown, incoming: unknown): unknown {
  if (typeof existing === "number" && typeof incoming === "string") {
    const n = Number(incoming);
    return Number.isNaN(n) ? 0 : n;
  }
  if (typeof existing === "boolean" && typeof incoming === "string") {
    return incoming === "true";
  }
  return incoming;
}

export function setByPath<T extends object>(
  obj: T,
  path: string,
  value: unknown,
): T {
  const keys = path.split(".");
  const existing = getAtPath(obj, path);
  const coerced = coerceValue(existing, value);
  const result = structuredClone(obj) as Record<string, unknown>;
  let current: Record<string, unknown> = result;

  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];
    current[key] = { ...(current[key] as Record<string, unknown>) };
    current = current[key] as Record<string, unknown>;
  }

  current[keys[keys.length - 1]] = coerced;
  return result as T;
}

export function calculateAge(dob: string): number {
  if (!dob) return 0;
  const birthDate = new Date(dob);
  if (Number.isNaN(birthDate.getTime())) return 0;
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }
  return age;
}

export function parseInputValue(
  target: HTMLInputElement | HTMLSelectElement,
): string | number | boolean | null {
  if (target.type === "checkbox") {
    return (target as HTMLInputElement).checked;
  }
  if (target.type === "number") {
    const rawValue = target.value;
    if (rawValue === "") return 0;
    const n = Number.parseFloat(rawValue);
    return Number.isFinite(n) ? n : 0;
  }
  return target.value;
}

export function applyFieldUpdate(
  prev: FinancialProfilePayload,
  name: string,
  value: string | number | boolean | null,
): FinancialProfilePayload {
  let next = setByPath(prev, name, value);
  if (name === "userInfo.dob" && typeof value === "string") {
    next = setByPath(next, "userInfo.age", calculateAge(value));
  }
  return next;
}

// Create default financial profile payload for a user with the given id. This is used when a user has no existing financial profile data in the database.
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
      payDate: {
        dayOfMonth: null,
      },
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
