"use client";

import { useEffect, useState } from "react";
import { formatGBP } from "@/lib/format/currency";
import { appliesToMonth } from "@/lib/monthly/merge-recurring";
import type { BudgetLineItem, MonthlyEntry } from "@/types/monthlyPlan";
import { MONTH_NAMES, summariseMonth } from "@/types/monthlyPlan";
import type { SavingsGoal } from "@/types/recurringBudget";
import {
  IncomeIcon,
  PencilIcon,
  PiggyBankIcon,
  ReceiptIcon,
  TrashIcon,
} from "./icons";

type MonthlyDetailViewProps = {
  year: number;
  resolveEntry: (year: number, month: number) => MonthlyEntry;
  baseNetMonthly: number;
  selectedMonth: number;
  onMonthChange: (month: number) => void;
  onSaveMonth: (entry: MonthlyEntry) => Promise<void>;
  savingsGoals: SavingsGoal[];
  /** Only the zoomed modal allows adding monthly savings allocations. */
  allowSavingsAdd?: boolean;
};

type RowVariant = "income" | "expense" | "savings";

function ItemCountBadge({
  count,
  color,
}: {
  count: number;
  color: "green" | "pink" | "purple";
}) {
  const styles = {
    green: "bg-emerald-100 text-emerald-700",
    pink: "bg-rose-100 text-rose-700",
    purple: "bg-violet-100 text-violet-700",
  };
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${styles[color]}`}
    >
      {count} Items
    </span>
  );
}

export default function MonthlyDetailView({
  year,
  resolveEntry,
  baseNetMonthly,
  selectedMonth,
  onMonthChange,
  onSaveMonth,
  savingsGoals,
  allowSavingsAdd = false,
}: MonthlyDetailViewProps) {
  const entry = resolveEntry(year, selectedMonth);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingKey, setEditingKey] = useState<string | null>(null);

  const [incomeLabel, setIncomeLabel] = useState("");
  const [incomeAmount, setIncomeAmount] = useState("");
  const [outLabel, setOutLabel] = useState("");
  const [outAmount, setOutAmount] = useState("");
  const [selectedGoalId, setSelectedGoalId] = useState("");
  const [savingsAmount, setSavingsAmount] = useState("");

  useEffect(() => {
    setEditingKey(null);
  }, [entry.year, entry.month]);

  const { totalIncome, totalOutgoings, totalSavings, remaining, baseIncome } =
    summariseMonth(entry, baseNetMonthly);

  async function persist(updated: MonthlyEntry) {
    setSaving(true);
    setError(null);
    try {
      await onSaveMonth(updated);
      setEditingKey(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save changes");
      throw err;
    } finally {
      setSaving(false);
    }
  }

  async function addItem(
    field: "incomes" | "expenditures" | "savings",
    item: Omit<BudgetLineItem, "id">,
  ) {
    const updated: MonthlyEntry = {
      ...entry,
      [field]: [...entry[field], { ...item, id: crypto.randomUUID() }],
    };
    await persist(updated);
  }

  async function updateItem(
    field: "incomes" | "expenditures" | "savings",
    id: string,
    label: string,
    amount: number,
  ) {
    const updated: MonthlyEntry = {
      ...entry,
      [field]: entry[field].map((i) =>
        i.id === id ? { ...i, label, amount } : i,
      ),
    };
    await persist(updated);
  }

  async function removeItem(
    field: "incomes" | "expenditures" | "savings",
    id: string,
  ) {
    const updated: MonthlyEntry = {
      ...entry,
      [field]: entry[field].filter((i) => i.id !== id),
    };
    await persist(updated);
  }

  async function saveSalary(amount: number) {
    await persist({ ...entry, takeHomeSalary: amount });
  }

  async function addOrUpdateSavingsGoal(goalId: string, amount: number) {
    const goal = savingsGoals.find((g) => g.id === goalId);
    if (!goal) return;

    const storedSavings = entry.savings.filter(
      (s) => !s.id.startsWith("savings-goal-"),
    );
    const existingIdx = storedSavings.findIndex(
      (s) => s.savingsGoalId === goalId,
    );

    const nextStored =
      existingIdx >= 0
        ? storedSavings.map((s, i) =>
            i === existingIdx ? { ...s, amount } : s,
          )
        : [
            ...storedSavings,
            {
              id: crypto.randomUUID(),
              label: goal.label,
              amount,
              savingsGoalId: goalId,
            },
          ];

    const mergedSavings = savingsGoals
      .filter((g) => appliesToMonth(g, entry.year, entry.month))
      .map((g) => {
        const override = nextStored.find((s) => s.savingsGoalId === g.id);
        if (override) return override;
        return {
          id: `savings-goal-${g.id}`,
          label: g.label,
          amount: g.amount ?? 0,
          savingsGoalId: g.id,
        };
      })
      .concat(nextStored.filter((s) => !s.savingsGoalId));

    await persist({ ...entry, savings: mergedSavings });
  }

  const manualIncomes = entry.incomes;
  const recurringExpenditures = entry.expenditures.filter((e) =>
    e.id.startsWith("recurring-"),
  );
  const manualExpenditures = entry.expenditures.filter(
    (e) => !e.id.startsWith("recurring-"),
  );
  const autoGoalSavings = entry.savings.filter((s) =>
    s.id.startsWith("savings-goal-"),
  );
  const overrideSavings = entry.savings.filter(
    (s) => s.savingsGoalId && !s.id.startsWith("savings-goal-"),
  );
  const legacyManualSavings = entry.savings.filter((s) => !s.savingsGoalId);

  const applicableGoals = savingsGoals.filter((g) =>
    appliesToMonth(g, entry.year, entry.month),
  );
  const overrideGoalIds = new Set(
    overrideSavings.map((s) => s.savingsGoalId).filter(Boolean),
  );
  const goalsForDropdown = applicableGoals.filter(
    (g) => !overrideGoalIds.has(g.id),
  );

  return (
    <div className="space-y-6">
      {error ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      <div className="flex flex-wrap gap-2">
        {MONTH_NAMES.map((name, idx) => {
          const month = idx + 1;
          const active = month === selectedMonth;
          return (
            <button
              key={name}
              type="button"
              onClick={() => onMonthChange(month)}
              className={`rounded-full border px-4 py-1.5 text-sm font-medium transition ${
                active
                  ? "border-violet-700 bg-violet-700 text-white shadow-sm"
                  : "border-transparent bg-white/60 text-slate-600 hover:bg-white"
              }`}
            >
              {name}
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <SummaryTile label="Base Net Pay" value={formatGBP(baseIncome)} />
        <SummaryTile
          label="Total Monthly Incomes"
          value={formatGBP(totalIncome)}
          valueClass="text-emerald-600"
        />
        <SummaryTile
          label="Total Outgoings"
          value={formatGBP(totalOutgoings)}
          valueClass="text-rose-500"
        />
        <SummaryTile
          label="Unallocated Remaining"
          value={formatGBP(remaining)}
          valueClass="text-emerald-600"
          highlight
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <PlannerColumn
          title="Monthly Incomes"
          icon={<IncomeIcon className="text-emerald-600" />}
          badge={
            <ItemCountBadge count={manualIncomes.length + 1} color="green" />
          }
          saving={saving}
        >
          <EditableBudgetRow
            rowKey="salary"
            label="Take-home Salary"
            amount={baseIncome}
            variant="income"
            sublabel={`Default ${formatGBP(baseNetMonthly)} from profile`}
            labelFixed
            editingKey={editingKey}
            onEdit={setEditingKey}
            onSave={async (_label, amount) => saveSalary(amount)}
            disabled={saving}
          />
          {manualIncomes.map((item) => (
            <EditableBudgetRow
              key={item.id}
              rowKey={item.id}
              label={item.label}
              amount={item.amount}
              variant="income"
              editingKey={editingKey}
              onEdit={setEditingKey}
              onSave={async (label, amount) =>
                updateItem("incomes", item.id, label, amount)
              }
              onDelete={() => removeItem("incomes", item.id)}
              disabled={saving}
            />
          ))}
          <AddRow
            fields={[
              {
                placeholder: "Source (e.g. Bonus)",
                value: incomeLabel,
                onChange: setIncomeLabel,
                wide: true,
              },
              {
                placeholder: "£0.00",
                value: incomeAmount,
                onChange: setIncomeAmount,
                type: "number",
              },
            ]}
            buttonClass="bg-emerald-600 hover:bg-emerald-700"
            disabled={saving}
            onAdd={async () => {
              if (!incomeLabel || !incomeAmount) return;
              await addItem("incomes", {
                label: incomeLabel,
                amount: Number(incomeAmount),
              });
              setIncomeLabel("");
              setIncomeAmount("");
            }}
          />
        </PlannerColumn>

        <PlannerColumn
          title="Monthly Outgoings"
          icon={<ReceiptIcon className="text-rose-500" />}
          badge={
            <ItemCountBadge count={entry.expenditures.length} color="pink" />
          }
          saving={saving}
        >
          {recurringExpenditures.map((item) => (
            <ReadOnlyRow
              key={item.id}
              label={item.label}
              amount={item.amount}
              variant="expense"
              sublabel="Recurring expense"
            />
          ))}
          {manualExpenditures.map((item) => (
            <EditableBudgetRow
              key={item.id}
              rowKey={item.id}
              label={item.label}
              amount={item.amount}
              variant="expense"
              editingKey={editingKey}
              onEdit={setEditingKey}
              onSave={async (label, amount) =>
                updateItem("expenditures", item.id, label, amount)
              }
              onDelete={() => removeItem("expenditures", item.id)}
              disabled={saving}
            />
          ))}
          <AddRow
            fields={[
              {
                placeholder: "Description",
                value: outLabel,
                onChange: setOutLabel,
                wide: true,
              },
              {
                placeholder: "£0.00",
                value: outAmount,
                onChange: setOutAmount,
                type: "number",
              },
            ]}
            buttonClass="bg-rose-500 hover:bg-rose-600"
            disabled={saving}
            onAdd={async () => {
              if (!outLabel || !outAmount) return;
              await addItem("expenditures", {
                label: outLabel,
                amount: Number(outAmount),
              });
              setOutLabel("");
              setOutAmount("");
            }}
          />
        </PlannerColumn>

        <PlannerColumn
          title="Savings Goals"
          icon={<PiggyBankIcon className="text-violet-600" />}
          badge={<ItemCountBadge count={entry.savings.length} color="purple" />}
          saving={saving}
        >
          {autoGoalSavings.map((item) => (
            <ReadOnlyRow
              key={item.id}
              label={item.label}
              amount={item.amount}
              variant="savings"
              sublabel={
                savingsGoals.find((goal) => goal.id === item.savingsGoalId)
                  ?.usesVariableAmount
                  ? "Variable monthly amount"
                  : "Savings goal"
              }
            />
          ))}
          {overrideSavings.map((item) => (
            <EditableBudgetRow
              key={item.id}
              rowKey={item.id}
              label={item.label}
              amount={item.amount}
              variant="savings"
              sublabel="Monthly allocation"
              labelFixed
              editingKey={editingKey}
              onEdit={setEditingKey}
              onSave={async (_label, amount) =>
                updateItem("savings", item.id, item.label, amount)
              }
              onDelete={() => removeItem("savings", item.id)}
              disabled={saving}
            />
          ))}
          {legacyManualSavings.map((item) => (
            <EditableBudgetRow
              key={item.id}
              rowKey={item.id}
              label={item.label}
              amount={item.amount}
              variant="savings"
              editingKey={editingKey}
              onEdit={setEditingKey}
              onSave={async (label, amount) =>
                updateItem("savings", item.id, label, amount)
              }
              onDelete={() => removeItem("savings", item.id)}
              disabled={saving}
            />
          ))}
          {allowSavingsAdd ? (
            goalsForDropdown.length > 0 ? (
              <>
                <p className="text-[11px] text-slate-400">
                  Choose the amount for this month. Variable goals can also be updated later from here.
                </p>
                <SavingsGoalAddRow
                  goals={goalsForDropdown}
                  selectedGoalId={selectedGoalId}
                  onGoalChange={setSelectedGoalId}
                  amount={savingsAmount}
                  onAmountChange={setSavingsAmount}
                  disabled={saving}
                  onAdd={async () => {
                    if (!selectedGoalId || !savingsAmount) return;
                    await addOrUpdateSavingsGoal(
                      selectedGoalId,
                      Number(savingsAmount),
                    );
                    setSelectedGoalId("");
                    setSavingsAmount("");
                  }}
                />
              </>
            ) : (
              <p className="mt-auto border-t border-slate-100 pt-3 text-center text-xs text-slate-400">
                {applicableGoals.length === 0
                  ? "Add savings goals on the Savings page first."
                  : "All goals for this month already have a monthly allocation."}
              </p>
            )
          ) : null}
        </PlannerColumn>
      </div>
    </div>
  );
}

function amountClass(variant: RowVariant, positive?: boolean) {
  if (variant === "income" || positive) return "text-emerald-600";
  if (variant === "savings") return "text-violet-600";
  return "text-rose-500";
}

function EditableBudgetRow({
  rowKey,
  label,
  amount,
  variant,
  sublabel,
  labelFixed,
  editingKey,
  onEdit,
  onSave,
  onDelete,
  disabled,
}: {
  rowKey: string;
  label: string;
  amount: number;
  variant: RowVariant;
  sublabel?: string;
  labelFixed?: boolean;
  editingKey: string | null;
  onEdit: (key: string | null) => void;
  onSave: (label: string, amount: number) => Promise<void>;
  onDelete?: () => void;
  disabled?: boolean;
}) {
  const isEditing = editingKey === rowKey;
  const [editLabel, setEditLabel] = useState(label);
  const [editAmount, setEditAmount] = useState(String(amount));
  const [savingRow, setSavingRow] = useState(false);

  useEffect(() => {
    if (!isEditing) {
      setEditLabel(label);
      setEditAmount(String(amount));
    }
  }, [label, amount, isEditing]);

  const positive = variant === "income";

  if (isEditing) {
    return (
      <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          {!labelFixed ? (
            <input
              value={editLabel}
              onChange={(e) => setEditLabel(e.target.value)}
              className="min-w-0 flex-1 rounded-lg border border-slate-200 px-2 py-1.5 text-sm"
              placeholder="Description"
            />
          ) : (
            <span className="min-w-0 flex-1 font-medium text-slate-800">
              {label}
            </span>
          )}
          <input
            type="number"
            min={0}
            value={editAmount}
            onChange={(e) => setEditAmount(e.target.value)}
            className="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm sm:w-28"
          />
          <button
            type="button"
            disabled={disabled || savingRow}
            onClick={async () => {
              const n = Number(editAmount);
              if (Number.isNaN(n) || n < 0) return;
              if (!labelFixed && !editLabel.trim()) return;
              setSavingRow(true);
              try {
                await onSave(labelFixed ? label : editLabel.trim(), n);
              } finally {
                setSavingRow(false);
              }
            }}
            className="shrink-0 rounded-lg bg-slate-800 px-3 py-1.5 text-xs font-medium text-white hover:bg-slate-900 disabled:opacity-60"
          >
            Save
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between gap-2 rounded-xl border border-slate-100 px-3 py-2.5 text-sm">
      <div className="min-w-0">
        <p className="truncate font-medium text-slate-800">{label}</p>
        {sublabel ? <p className="text-xs text-slate-400">{sublabel}</p> : null}
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <span className={`font-semibold ${amountClass(variant, positive)}`}>
          {positive ? "+" : "−"}
          {formatGBP(amount)}
        </span>
        <button
          type="button"
          disabled={disabled}
          onClick={() => onEdit(rowKey)}
          className="rounded p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
          aria-label={`Edit ${label}`}
        >
          <PencilIcon />
        </button>
        {onDelete ? (
          <button
            type="button"
            disabled={disabled}
            onClick={onDelete}
            className="rounded p-1 text-slate-300 transition hover:text-rose-500 disabled:opacity-50"
            aria-label={`Remove ${label}`}
          >
            <TrashIcon />
          </button>
        ) : null}
      </div>
    </div>
  );
}

function ReadOnlyRow({
  label,
  amount,
  variant,
  sublabel,
}: {
  label: string;
  amount: number;
  variant: RowVariant;
  sublabel?: string;
}) {
  const positive = variant === "income";
  return (
    <div className="flex items-center justify-between gap-2 rounded-xl border border-slate-100 px-3 py-2.5 text-sm">
      <div className="min-w-0">
        <p className="truncate font-medium text-slate-800">{label}</p>
        {sublabel ? <p className="text-xs text-slate-400">{sublabel}</p> : null}
      </div>
      <span
        className={`shrink-0 font-semibold ${amountClass(variant, positive)}`}
      >
        {positive ? "+" : "−"}
        {formatGBP(amount)}
      </span>
    </div>
  );
}

function SummaryTile({
  label,
  value,
  valueClass = "text-slate-900",
  highlight = false,
}: {
  label: string;
  value: string;
  valueClass?: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border bg-white p-4 shadow-sm ${
        highlight
          ? "border-emerald-300 ring-1 ring-emerald-100"
          : "border-slate-200"
      }`}
    >
      <p className="text-xs text-slate-500">{label}</p>
      <p className={`mt-1 text-2xl font-bold ${valueClass}`}>{value}</p>
    </div>
  );
}

function PlannerColumn({
  title,
  icon,
  badge,
  children,
  saving,
}: {
  title: string;
  icon: React.ReactNode;
  badge: React.ReactNode;
  children: React.ReactNode;
  saving: boolean;
}) {
  return (
    <div className="flex min-h-[420px] flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2 font-semibold text-slate-800">
          {icon}
          {title}
        </div>
        {badge}
      </div>
      <div className="flex flex-1 flex-col gap-2 overflow-y-auto">
        {children}
      </div>
      {saving ? (
        <p className="mt-2 text-center text-xs text-slate-400">Saving…</p>
      ) : null}
    </div>
  );
}

function SavingsGoalAddRow({
  goals,
  selectedGoalId,
  onGoalChange,
  amount,
  onAmountChange,
  onAdd,
  disabled,
}: {
  goals: SavingsGoal[];
  selectedGoalId: string;
  onGoalChange: (id: string) => void;
  amount: string;
  onAmountChange: (v: string) => void;
  onAdd: () => void | Promise<void>;
  disabled?: boolean;
}) {
  return (
    <div className="mt-auto flex gap-2 border-t border-slate-100 pt-3">
      <select
        value={selectedGoalId}
        onChange={(e) => onGoalChange(e.target.value)}
        disabled={disabled}
        className="min-w-0 flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm disabled:opacity-60"
      >
        <option value="">Select savings goal…</option>
        {goals.map((g) => (
          <option key={g.id} value={g.id}>
            {g.label}
          </option>
        ))}
      </select>
      <input
        type="number"
        min={0}
        value={amount}
        onChange={(e) => onAmountChange(e.target.value)}
        placeholder="£0.00"
        disabled={disabled}
        className="w-24 rounded-lg border border-slate-200 px-3 py-2 text-sm disabled:opacity-60"
      />
      <button
        type="button"
        disabled={disabled || !selectedGoalId || !amount}
        onClick={() => void onAdd()}
        className="shrink-0 rounded-lg bg-violet-600 px-3 py-2 text-lg font-bold text-white hover:bg-violet-700 disabled:opacity-60"
      >
        +
      </button>
    </div>
  );
}

function AddRow({
  fields,
  buttonClass,
  onAdd,
  disabled,
}: {
  fields: Array<{
    placeholder: string;
    value: string;
    onChange: (v: string) => void;
    wide?: boolean;
    type?: string;
  }>;
  buttonClass: string;
  onAdd: () => void | Promise<void>;
  disabled?: boolean;
}) {
  return (
    <div className="mt-auto flex gap-2 border-t border-slate-100 pt-3">
      {fields.map((f) => (
        <input
          key={f.placeholder}
          type={f.type ?? "text"}
          value={f.value}
          onChange={(e) => f.onChange(e.target.value)}
          placeholder={f.placeholder}
          disabled={disabled}
          className={`rounded-lg border border-slate-200 px-3 py-2 text-sm disabled:opacity-60 ${
            f.wide ? "min-w-0 flex-1" : "w-24"
          }`}
        />
      ))}
      <button
        type="button"
        disabled={disabled}
        onClick={() => void onAdd()}
        className={`shrink-0 rounded-lg px-3 py-2 text-lg font-bold text-white disabled:opacity-60 ${buttonClass}`}
      >
        +
      </button>
    </div>
  );
}
