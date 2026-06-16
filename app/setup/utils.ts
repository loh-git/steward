import type { FinancialProfilePayload } from "./types";

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
): string | number | boolean {
  if (target.type === "checkbox") {
    return (target as HTMLInputElement).checked;
  }
  if (target.type === "number") {
    const n = target.valueAsNumber;
    return Number.isNaN(n) ? 0 : n;
  }
  return target.value;
}

export function applyFieldUpdate(
  prev: FinancialProfilePayload,
  name: string,
  value: string | number | boolean,
): FinancialProfilePayload {
  let next = setByPath(prev, name, value);
  if (name === "userInfo.dob" && typeof value === "string") {
    next = setByPath(next, "userInfo.age", calculateAge(value));
  }
  return next;
}
