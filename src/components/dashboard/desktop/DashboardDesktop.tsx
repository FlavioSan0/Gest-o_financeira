import { CategoryExpensesPieChart } from "@/components/dashboard/CategoryExpensesPieChart";
import { DashboardHero } from "@/components/dashboard/DashboardHero";
import { DashboardInsights } from "@/components/dashboard/DashboardInsights";
import { DashboardMonthSelector } from "@/components/dashboard/DashboardMonthSelector";
import { MonthlyOverview } from "@/components/dashboard/MonthlyOverview";
import { RecentTransactions } from "@/components/dashboard/RecentTransactions";
import { ResponsibleOverview } from "@/components/dashboard/ResponsibleOverview";
import { SummaryCard } from "@/components/dashboard/SummaryCard";
import { TransactionsChart } from "@/components/dashboard/TransactionsChart";

import {
  ArrowDownCircle,
  ArrowUpCircle,
  PiggyBank,
  Wallet,
} from "lucide-react";

type DashboardData = {
  monthLabel: string;
  referenceMonth: number;
  referenceYear: number;
  balance: string;
  income: string;
  expenses: string;
  goalsTotal: string;
  incomeTransactionsCount: number;
  expenseTransactionsCount: number;
  activeGoalsCount: number;
  pendingBillsCount: number;
  activeCardsCount: number;
  chartTransactions: {
    id: string;
    amount: number;
    type: "INCOME" | "EXPENSE";
    status: string;
    transactionDate: string;
    categoryId: string | null;
    category: string;
    responsibleId: string | null;
    responsible: string;
  }[];
  categoryExpenseSummary: {
    categoryId: string | null;
    categoryName: string;
    amount: number;
    formattedAmount: string;
    percentage: number;
  }[];
  categoryExpenseForecastSummary: {
    categoryId: string | null;
    categoryName: string;
    amount: number;
    formattedAmount: string;
    percentage: number;
  }[];
  largestExpense: {
    id: string;
    description: string;
    amount: number;
    formattedAmount: string;
    date: string;
    categoryName: string;
  } | null;
  topExpenseCategory: {
    categoryId: string | null;
    categoryName: string;
    amount: number;
    formattedAmount: string;
    percentage: number;
  } | null;
  upcomingPending: {
    id: string;
    description: string;
    amount: number;
    formattedAmount: string;
    dueDate: string;
    categoryName: string;
  }[];
  responsibleSummaries: {
    id: string;
    name: string;
    income: string;
    expenses: string;
    balance: string;
    transactionsCount: number;
  }[];
  recentTransactions: {
    id: string;
    description: string;
    amount: string;
    type: "INCOME" | "EXPENSE";
    status: string;
    date: string;
    category: string;
    responsible: string;
  }[];
};

type DashboardDesktopProps = {
  dashboard: DashboardData;
};

export function DashboardDesktop({ dashboard }: DashboardDesktopProps) {
  const summaryCards = [
    {
      title: "Saldo real",
      value: dashboard.balance,
      description: "Apenas PAID no mes",
      icon: Wallet,
      detail: "Entradas - saidas",
      valueClassName: "text-white",
    },
    {
      title: "Receita",
      value: dashboard.income,
      description: "Receitas pagas",
      icon: ArrowUpCircle,
      detail: `${dashboard.incomeTransactionsCount} lancamentos`,
      valueClassName: "finance-income",
    },
    {
      title: "Despesa",
      value: dashboard.expenses,
      description: "Despesas pagas",
      icon: ArrowDownCircle,
      detail: `${dashboard.expenseTransactionsCount} lancamentos`,
      valueClassName: "finance-expense",
    },
    {
      title: "Pendentes",
      value: `${dashboard.pendingBillsCount}`,
      description: "Aguardando pagamento",
      icon: PiggyBank,
      detail: "Ver previsao",
      valueClassName: "text-white",
    },
  ];

  return (
    <div className="app-container dashboard-grid">
      <DashboardMonthSelector
        month={dashboard.referenceMonth}
        year={dashboard.referenceYear}
        label={`Referência: ${dashboard.monthLabel}`}
      />

      <DashboardHero
        monthLabel={dashboard.monthLabel}
        balance={dashboard.balance}
      />

      <section className="dashboard-summary-grid">
        {summaryCards.map((card) => (
          <SummaryCard key={card.title} {...card} />
        ))}
      </section>

      <DashboardInsights
        largestExpense={dashboard.largestExpense}
        topExpenseCategory={dashboard.topExpenseCategory}
        upcomingPending={dashboard.upcomingPending}
      />

      <section className="dashboard-charts-grid">
        <TransactionsChart
          chartTransactions={dashboard.chartTransactions}
          responsibleSummaries={dashboard.responsibleSummaries}
        />

        <CategoryExpensesPieChart
          categoryExpenseSummary={dashboard.categoryExpenseSummary}
          categoryExpenseForecastSummary={
            dashboard.categoryExpenseForecastSummary
          }
        />
      </section>

      <ResponsibleOverview
        totalBalance={dashboard.balance}
        totalIncome={dashboard.income}
        totalExpenses={dashboard.expenses}
        responsibleSummaries={dashboard.responsibleSummaries}
      />

      <section className="dashboard-bottom-grid">
        <RecentTransactions transactions={dashboard.recentTransactions} />

        <MonthlyOverview
          monthLabel={dashboard.monthLabel}
          pendingBillsCount={dashboard.pendingBillsCount}
          activeCardsCount={dashboard.activeCardsCount}
          activeGoalsCount={dashboard.activeGoalsCount}
        />
      </section>
    </div>
  );
}
