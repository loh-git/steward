import { cookies } from "next/headers";
import { CalculationInput } from "@/types/userFinancialInformation";

export default async function Dashboard() {
  const cookieStore = await cookies();
  const data = cookieStore.get("financial-input")?.value;

  const input: CalculationInput = data ? JSON.parse(data) : null;

  if (!input) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-black p-8">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            No Financial Data
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Please complete the setup form first.
          </p>
          <a
            href="/setup"
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Go to Setup
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          Dashboard
        </h1>

        <div className="bg-white dark:bg-zinc-900 p-6 rounded-lg shadow mb-6">
          <h2 className="text-xl font-semibold mb-4">Your Input</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Salary:</span>{" "}
              <span className="font-medium">
                £{input.salary.amount.toLocaleString()} / {input.salary.period}
              </span>
            </div>
            <div>
              <span className="text-gray-500">Pay Frequency:</span>{" "}
              <span className="font-medium">{input.payFrequency}</span>
            </div>
            <div>
              <span className="text-gray-500">Tax Year:</span>{" "}
              <span className="font-medium">{input.taxYear}</span>
            </div>
            <div>
              <span className="text-gray-500">Region:</span>{" "}
              <span className="font-medium">{input.region}</span>
            </div>
            <div>
              <span className="text-gray-500">Tax Code:</span>{" "}
              <span className="font-medium">{input.taxCode}</span>
            </div>
            <div>
              <span className="text-gray-500">NI Category:</span>{" "}
              <span className="font-medium">
                {input.nationalInsuranceCategory}
              </span>
            </div>
            <div>
              <span className="text-gray-500">Pension:</span>{" "}
              <span className="font-medium">
                {input.pension.employeeContributionPercent}%
              </span>
            </div>
            <div>
              <span className="text-gray-500">Student Loan:</span>{" "}
              <span className="font-medium">{input.studentLoan.plan}</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Calculation Results</h2>
          <p className="text-gray-500">
            Connect to the calculation API here to get the take-home pay
            breakdown.
          </p>
        </div>
      </div>
    </div>
  );
}
