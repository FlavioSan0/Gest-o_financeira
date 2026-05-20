"use client";

import { useMemo, useState } from "react";

type ChartTransaction = {
  id: string;
  amount: number;
  type: "INCOME" | "EXPENSE";
  status: string;
  transactionDate: string;
  categoryId: string | null;
  category: string;
  responsibleId: string | null;
  responsible: string;
};

type ResponsibleSummary = {
  id: string;
  name: string;
  income: string;
  expenses: string;
  balance: string;
  transactionsCount: number;
};

type TransactionsChartProps = {
  chartTransactions: ChartTransaction[];
  responsibleSummaries: ResponsibleSummary[];
};

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

function getMonthKey(dateValue: string) {
  const date = new Date(dateValue);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

function getMonthLabelFromKey(monthKey: string) {
  const [year, month] = monthKey.split("-");
  return new Intl.DateTimeFormat("pt-BR", {
    month: "short",
    year: "2-digit",
  }).format(new Date(Number(year), Number(month) - 1, 1));
}

function getDisplayName(name: string) {
  if (name === "Ana Paula") {
    return "Ana";
  }

  return name;
}

export function TransactionsChart({
  chartTransactions,
  responsibleSummaries,
}: TransactionsChartProps) {
  const [selectedMonth, setSelectedMonth] = useState("ALL");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [selectedResponsible, setSelectedResponsible] = useState("ALL");
  const [includePending, setIncludePending] = useState(false);

  const monthOptions = useMemo(() => {
    const months = new Map<string, string>();

    chartTransactions.forEach((transaction) => {
      const key = getMonthKey(transaction.transactionDate);
      if (!months.has(key)) {
        months.set(key, getMonthLabelFromKey(key));
      }
    });

    return Array.from(months.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [chartTransactions]);

  const categoryOptions = useMemo(() => {
    const categories = new Map<string, string>();

    chartTransactions.forEach((transaction) => {
      if (transaction.categoryId) {
        categories.set(transaction.categoryId, transaction.category);
      }
    });

    return Array.from(categories.entries()).map(([id, name]) => ({
      id,
      name,
    }));
  }, [chartTransactions]);

  const responsibleOptions = useMemo(() => {
    const options = [
      { id: "ALL", name: "Todos" },
      { id: "COUPLE", name: "Casal" },
      ...responsibleSummaries.map((summary) => ({
        id: summary.id,
        name: getDisplayName(summary.name),
      })),
    ];

    return options;
  }, [responsibleSummaries]);

  const filteredTransactions = useMemo(() => {
    const allowedStatuses = includePending ? ["PAID", "PENDING"] : ["PAID"];

    return chartTransactions.filter((transaction) => {
      const statusMatches = allowedStatuses.includes(transaction.status);
      const monthMatches =
        selectedMonth === "ALL" ||
        getMonthKey(transaction.transactionDate) === selectedMonth;
      const categoryMatches =
        selectedCategory === "ALL" ||
        transaction.categoryId === selectedCategory;
      const responsibleMatches =
        selectedResponsible === "ALL" ||
        selectedResponsible === "COUPLE" ||
        transaction.responsibleId === selectedResponsible;

      return (
        statusMatches &&
        monthMatches &&
        categoryMatches &&
        responsibleMatches
      );
    });
  }, [
    chartTransactions,
    includePending,
    selectedMonth,
    selectedCategory,
    selectedResponsible,
  ]);

  const chartPoints = useMemo(() => {
    if (selectedMonth !== "ALL") {
      const income = filteredTransactions
        .filter((transaction) => transaction.type === "INCOME")
        .reduce((sum, transaction) => sum + transaction.amount, 0);
      const expenses = filteredTransactions
        .filter((transaction) => transaction.type === "EXPENSE")
        .reduce((sum, transaction) => sum + transaction.amount, 0);

      return [
        {
          month: selectedMonth,
          label: getMonthLabelFromKey(selectedMonth),
          income,
          expenses,
        },
      ];
    }

    const points = monthOptions.map(([monthKey, label]) => ({
      month: monthKey,
      label,
      income: 0,
      expenses: 0,
    }));

    const grouped = new Map(points.map((point) => [point.month, point]));

    filteredTransactions.forEach((transaction) => {
      const key = getMonthKey(transaction.transactionDate);
      const current = grouped.get(key);

      if (!current) {
        return;
      }

      if (transaction.type === "INCOME") {
        current.income += transaction.amount;
      } else {
        current.expenses += transaction.amount;
      }
    });

    return Array.from(grouped.values()).slice(-6);
  }, [filteredTransactions, monthOptions, selectedMonth]);

  const totalIncome = chartPoints.reduce(
    (sum, point) => sum + point.income,
    0,
  );

  const totalExpenses = chartPoints.reduce(
    (sum, point) => sum + point.expenses,
    0,
  );

  const maxValue = Math.max(
    ...chartPoints.flatMap((point) => [point.income, point.expenses]),
    1,
  );

  return (
    <article className="app-card transactions-chart dashboard-chart-card p-5">
      <div className="flex flex-col gap-4">
        <div>
          <p className="text-sm font-medium app-faint-text">
            Gr&aacute;fico interativo
          </p>
          <h2 className="text-xl font-bold tracking-[-0.03em] text-white">
            Receita x Despesa
          </h2>
        </div>

        <div className="grid gap-2 sm:grid-cols-3">
          <label className="block">
            <span className="text-[0.66rem] font-bold uppercase tracking-[0.14em] text-white/45">
              M&ecirc;s
            </span>
            <select
              value={selectedMonth}
              onChange={(event) => setSelectedMonth(event.target.value)}
              className="finance-input transactions-chart__select mt-1.5 w-full"
            >
              <option value="ALL">Todos</option>
              {monthOptions.map(([monthKey, label]) => (
                <option key={monthKey} value={monthKey}>
                  {label}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="text-[0.66rem] font-bold uppercase tracking-[0.14em] text-white/45">
              Categoria
            </span>
            <select
              value={selectedCategory}
              onChange={(event) => setSelectedCategory(event.target.value)}
              className="finance-input transactions-chart__select mt-1.5 w-full"
            >
              <option value="ALL">Todas</option>
              {categoryOptions.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="text-[0.66rem] font-bold uppercase tracking-[0.14em] text-white/45">
              Respons&aacute;vel
            </span>
            <select
              value={selectedResponsible}
              onChange={(event) => setSelectedResponsible(event.target.value)}
              className="finance-input transactions-chart__select mt-1.5 w-full"
            >
              {responsibleOptions.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.name}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      <div className="mt-4 overflow-x-auto">
        <div className="grid gap-4 transactions-chart__bars">
          {chartPoints.map((point) => {
            const incomeHeight = Math.round((point.income / maxValue) * 100);
            const expenseHeight = Math.round(
              (point.expenses / maxValue) * 100,
            );

            return (
              <div key={point.month} className="transactions-chart__column">
                <div className="flex h-28 flex-col justify-end gap-1.5 sm:h-32">
                  <div
                    className="transactions-chart__bar transactions-chart__bar--income"
                    style={{ height: `${incomeHeight}%` }}
                    title={`Receita ${point.label}: ${currencyFormatter.format(point.income)}`}
                  />

                  <div
                    className="transactions-chart__bar transactions-chart__bar--expense"
                    style={{ height: `${expenseHeight}%` }}
                    title={`Despesa ${point.label}: ${currencyFormatter.format(point.expenses)}`}
                  />
                </div>

                <span className="transactions-chart__label">{point.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="transactions-chart__footer">
        <label className="inline-flex cursor-pointer items-center gap-2 text-xs font-medium text-white/62">
          <input
            type="checkbox"
            checked={includePending}
            onChange={(event) => setIncludePending(event.target.checked)}
            className="h-4 w-4 rounded border-white/20 bg-black text-white"
          />
          Incluir pendentes
        </label>

        <div className="transactions-chart__totals">
          <span>
            Receita{" "}
            <strong className="finance-income">
              {currencyFormatter.format(totalIncome)}
            </strong>
          </span>
          <span>
            Despesa{" "}
            <strong className="finance-expense">
              {currencyFormatter.format(totalExpenses)}
            </strong>
          </span>
        </div>
      </div>
    </article>
  );
}
