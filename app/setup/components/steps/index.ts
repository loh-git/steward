import Step1Salary from "./step-1-salary";
import Step2Pension from "./step-2-pension";
import Step3StudentLoans from "./step-3-student-loans";
import Step4Extras from "./step-4-extras";
import Step5Review from "./step-5-review";

export const WIZARD_STEPS = [
  { id: "salary", title: "You & Your Salary", Component: Step1Salary },
  { id: "pension", title: "Pension", Component: Step2Pension },
  { id: "student-loans", title: "Student Loans", Component: Step3StudentLoans },
  { id: "extras", title: "Extra Income & Deductions", Component: Step4Extras },
  { id: "review", title: "Other Options & Your Estimate", Component: Step5Review },
] as const;
