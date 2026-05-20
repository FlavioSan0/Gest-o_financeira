"use client";

import { useMemo, useState } from "react";
import { PieChart } from "lucide-react";
import type { CategoryExpenseSummary } from "@/services/dashboard-service";

type CategoryExpensesPieChartProps = {
  categoryExpenseSummary: CategoryExpenseSummary[];
  categoryExpenseForecastSummary: CategoryExpenseSummary[];
};

const SLICE_COLORS = [
  "#22c55e",
  "#38bdf8",
  "#f97316",
  "#a78bfa",
  "#f43f5e",
  "#eab308",
  "#14b8a6",
  "#f472b6",
];

function buildPieGradient(items: CategoryExpenseSummary[]) {
  if (items.length === 0) {
    return "conic-gradient(rgba(255,255,255,0.08) 0deg 360deg)";
  }

  let cursor = 0;

  return `conic-gradient(${items
    .map((item, index) => {
      const start = cursor;
      const end = cursor + item.percentage * 3.6;
      cursor = end;

      return `${SLICE_COLORS[index % SLICE_COLORS.length]} ${start}deg ${end}deg`;
    })
    .join(", ")})`;
}

export function CategoryExpensesPieChart({
  categoryExpenseSummary,
  categoryExpenseForecastSummary,
}: CategoryExpensesPieChartProps) {
  const [includePending, setIncludePending] = useState(false);
  const data = includePending
    ? categoryExpenseForecastSummary
    : categoryExpenseSummary;
  const total = data.reduce((sum, item) => sum + item.amount, 0);
  const formattedTotal = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(total);
  const pieGradient = useMemo(() => buildPieGradient(data), [data]);

  return (
    <article className="app-card category-expenses-card dashboard-chart-card p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-medium app-faint-text">
            Despesas do m&ecirc;s
          </p>
          <h2 className="text-xl font-bold tracking-[-0.03em] text-white">
            Despesas por categoria
          </h2>
        </div>

        <label className="inline-flex cursor-pointer items-center gap-2 text-xs font-medium text-white/62">
          <input
            type="checkbox"
            checked={includePending}
            onChange={(event) => setIncludePending(event.target.checked)}
            className="h-4 w-4 rounded border-white/20 bg-black text-white"
          />
          Incluir pendentes
        </label>
      </div>

      {data.length === 0 ? (
        <div className="mt-5 flex min-h-56 flex-col items-center justify-center rounded-3xl border border-dashed border-white/15 bg-black/25 p-6 text-center">
          <div className="app-icon-box h-12 w-12 rounded-2xl">
            <PieChart className="h-6 w-6" />
          </div>

          <h3 className="mt-4 text-base font-bold text-white">
            Nenhuma despesa paga neste m&ecirc;s
          </h3>

          <p className="mt-2 max-w-sm text-sm leading-6 app-faint-text">
            Ative pendentes para ver previs&otilde;es ou registre despesas PAID.
          </p>
        </div>
      ) : (
        <div className="mt-5 grid gap-5 md:grid-cols-[minmax(10rem,0.62fr)_minmax(0,1fr)] md:items-center">
          <div className="category-expenses-pie-wrap">
            <div
              className="category-expenses-pie"
              style={{ background: pieGradient }}
              aria-label={`Despesas por categoria. Total: ${formattedTotal}`}
            >
              <div className="category-expenses-pie__center">
                <span>Total</span>
                <strong>{formattedTotal}</strong>
              </div>
            </div>
          </div>

          <ul className="category-expenses-list grid gap-2">
            {data.map((item, index) => (
              <li
                key={item.categoryId ?? "NO_CATEGORY"}
                className="category-expenses-row"
              >
                <span
                  className="category-expenses-row__dot"
                  style={{
                    backgroundColor:
                      SLICE_COLORS[index % SLICE_COLORS.length],
                  }}
                />

                <div className="min-w-0">
                  <strong>{item.categoryName}</strong>
                  <span>{item.percentage.toLocaleString("pt-BR")}%</span>
                </div>

                <b>{item.formattedAmount}</b>
              </li>
            ))}
          </ul>
        </div>
      )}
    </article>
  );
}
