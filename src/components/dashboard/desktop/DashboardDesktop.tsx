import { DashboardHero } from "@/components/dashboard/DashboardHero";
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
      title: "Saldo previsto",
      value: dashboard.balance,
      description: "Saldo com valores PAID do mês",
      icon: Wallet,
      detail: "Resumo financeiro direto",
      valueClassName: "text-white",
    },
    {
      title: "Receita",
      value: dashboard.income,
      description: "Receitas PAID",
      icon: ArrowUpCircle,
      detail: `${dashboard.incomeTransactionsCount} lançamentos`,
      valueClassName: "finance-income",
    },
    {
      title: "Despesa",
      value: dashboard.expenses,
      description: "Despesas PAID",
      icon: ArrowDownCircle,
      detail: `${dashboard.expenseTransactionsCount} lançamentos`,
      valueClassName: "finance-expense",
    },
    {
      title: "Pendentes",
      value: `${dashboard.pendingBillsCount}`,
      description: "Contas aguardando pagamento",
      icon: PiggyBank,
      detail: "Apenas pendências ativas",
      valueClassName: "text-white",
    },
  ];

  return (
    <div className="app-container dashboard-grid">
      <DashboardHero
        monthLabel={dashboard.monthLabel}
        balance={dashboard.balance}
      />

      <section className="dashboard-summary-grid">
        {summaryCards.map((card) => (
          <SummaryCard key={card.title} {...card} />
        ))}
      </section>

      <TransactionsChart
        chartTransactions={dashboard.chartTransactions}
        responsibleSummaries={dashboard.responsibleSummaries}
      />

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