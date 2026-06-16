"use client";

import { useState } from "react";

type MonthData = {
  year: number;
  month: number;
  incomes: Array<{ id: string; label: string; amount: number }>;
  expenditures: Array<{ id: string; label: string; amount: number }>;
};

export default function MonthGrid({
  initialYear,
  monthsData,
  defaultMonthly,
}: {
  initialYear: number;
  monthsData: MonthData[];
  defaultMonthly: number;
}) {
  const [year, setYear] = useState(initialYear);
  const [zoomMonth, setZoomMonth] = useState<number | null>(null);

  const months = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

  if (zoomMonth) {
    const m = monthsData.find((x) => x.month === zoomMonth && x.year === year) || {
      year,
      month: zoomMonth,
      incomes: [],
      expenditures: [],
    };
    const [label, setLabel] = useState("");
    const [amount, setAmount] = useState("");
    async function addIncome() {
      if (!label || !amount) return;
      const res = await fetch("/api/monthly-entries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ year, month: zoomMonth, incomes: [{ id: crypto.randomUUID(), label, amount: Number(amount) }], expenditures: [] }),
      });
      if (res.ok) {
        window.location.reload();
      }
    }
    return (
      <div>
        <div className="flex items-center gap-2 mb-4">
          <button onClick={() => setZoomMonth(null)} className="px-3 py-1 border rounded">Back</button>
          <div className="font-medium">{new Date(year, zoomMonth - 1, 1).toLocaleString("default", { month: "long" })} {year}</div>
        </div>
        <div className="bg-white dark:bg-zinc-900 p-4 rounded shadow">
          <h3 className="font-semibold mb-2">Income</h3>
          <div className="mb-4">Base: £{defaultMonthly.toLocaleString()}</div>
          {m.incomes.map((i) => (
            <div key={i.id} className="flex justify-between">
              <div>{i.label}</div>
              <div>£{i.amount}</div>
            </div>
          ))}

          <div className="mt-4">
            <div className="flex gap-2 mb-2">
              <input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Label" className="p-1 border rounded flex-1" />
              <input value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Amount" className="p-1 border rounded w-24" />
              <button onClick={addIncome} className="px-3 py-1 bg-blue-600 text-white rounded">Add</button>
            </div>
          </div>

          <h3 className="font-semibold mt-4 mb-2">Expenditure</h3>
          {m.expenditures.map((e) => (
            <div key={e.id} className="flex justify-between">
              <div>{e.label}</div>
              <div>£{e.amount}</div>
            </div>
          ))}

          <div className="mt-4">
            <button onClick={async () => { const l = prompt('Expenditure label'); const a = prompt('Amount'); if (l && a) { fetch('/api/monthly-entries',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({year,month:zoomMonth,expenditures:[{id:crypto.randomUUID(),label:l,amount:Number(a)}],incomes:[]})}).then(r=>r.ok&&window.location.reload()) } }} className="px-3 py-1 bg-red-600 text-white rounded">Add expenditure</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex gap-2 mb-4 items-center">
        <button onClick={() => setYear((y) => y - 1)} className="px-3 py-1 border rounded">Prev Year</button>
        <div className="font-medium">{year}</div>
        <button onClick={() => setYear((y) => y + 1)} className="px-3 py-1 border rounded">Next Year</button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {months.map((m) => {
          const monthData = monthsData.find((x) => x.month === m && x.year === year) || { year, month: m, incomes: [], expenditures: [] };
          return (
            <div key={m} className="border rounded p-4 min-h-[220px] flex flex-col">
              <div className="flex justify-between items-center mb-2">
                <div className="font-semibold">{new Date(year, m - 1, 1).toLocaleString("default", { month: "long" })}</div>
                <button onClick={() => setZoomMonth(m)} className="text-sm">Zoom</button>
              </div>
              <div className="flex-1 flex flex-col">
                <section className="mb-2">
                  <div className="text-xs text-zinc-500">Income</div>
                  <div className="font-medium mb-2">£{defaultMonthly.toLocaleString()}</div>
                  {monthData.incomes.map((i) => (
                    <div key={i.id} className="flex justify-between text-sm">
                      <div>{i.label}</div>
                      <div>+£{i.amount}</div>
                    </div>
                  ))}
                </section>

                <section className="mb-2 mt-auto">
                  <div className="text-xs text-zinc-500">Expenditure</div>
                  {monthData.expenditures.map((e) => (
                    <div key={e.id} className="flex justify-between text-sm">
                      <div>{e.label}</div>
                      <div>−£{e.amount}</div>
                    </div>
                  ))}
                </section>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
