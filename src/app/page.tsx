import { AppShell } from "@/components/layout/AppShell";
import { DashboardHero } from "@/components/dashboard/DashboardHero";
import { MonthlyOverview } from "@/components/dashboard/MonthlyOverview";
import { RecentTransactions } from "@/components/dashboard/RecentTransactions";
import { ResponsibleOverview } from "@/components/dashboard/ResponsibleOverview";
import { SummaryCard } from "@/components/dashboard/SummaryCard";
import { getDashboardData } from "@/services/dashboard-service";

import {
  ArrowDownCircle,
  ArrowUpCircle,
  PiggyBank,
  Wallet,
} from "lucide-react";

export default async function Home() {
  const dashboard = await getDashboardData();

  const summaryCards = [
    {
      title: "Saldo previsto",
      value: dashboard.balance,
      description: "Entradas menos saídas do mês",
      icon: Wallet,
      detail: "Atualizado em tempo real",
      valueClassName: "text-white",
    },
    {
      title: "Entradas",
      value: dashboard.income,
      description: "Receitas registradas",
      icon: ArrowUpCircle,
      detail: `${dashboard.incomeTransactionsCount} lançamentos`,
      valueClassName: "finance-income",
    },
    {
      title: "Saídas",
      value: dashboard.expenses,
      description: "Despesas registradas",
      icon: ArrowDownCircle,
      detail: `${dashboard.expenseTransactionsCount} lançamentos`,
      valueClassName: "finance-expense",
    },
    {
      title: "Metas",
      value: dashboard.goalsTotal,
      description: "Valor reservado até agora",
      icon: PiggyBank,
      detail: `${dashboard.activeGoalsCount} metas ativas`,
      valueClassName: "finance-goal",
    },
  ];

  return (
    <AppShell>
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
    </AppShell>
  );
}