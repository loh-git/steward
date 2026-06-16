import type { FinancialProfilePayload } from "@/app/setup/types";

export type ProfileRow = {
  id: string;
  first_name: string;
  last_name: string;
  date_of_birth: string | null;
  created_at: string;
  updated_at: string;
};

export type FinancialProfileRow = {
  id: string;
  user_id: string;
  tax_year: string;
  payload: FinancialProfilePayload;
  created_at: string;
  updated_at: string;
};
