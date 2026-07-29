// ==== TAKE-HOME CALCULATION TYPES ====

// Deductions type for take-home pay calculation
export type TakeHomeDeductions = {
    incomeTax: number;
    nationalInsurance: number;
    pension: number;
    studentLoan: number;
  };
  
  // Take-home pay calculation result type 
  export type TakeHomeResult = {
    grossAnnual: number;
    grossMonthly: number;
    deductions: TakeHomeDeductions;
    totalDeductionsAnnual: number;
    netAnnual: number;
    netMonthly: number;
    /** True when annual gross salary is zero — estimates hidden. Possibly don't need this?*/
    hasIncome: boolean;
  };