import Link from "next/link";
import {
  ArrowDownCircle,
  ArrowRight,
  ArrowUpCircle,
  CreditCard,
  PiggyBank,
  Plus,
  ReceiptText,
  Target,
  UserRound,
  UsersRound,
  Wallet,
} from "lucide-react";
import { CategoryExpensesPieChart } from "@/components/dashboard/CategoryExpensesPieChart";
import { DashboardInsights } from "@/components/dashboard/DashboardInsights";
import { TransactionsChart } from "@/components/dashboard/TransactionsChart";

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

type DashboardMobileProps = {
  dashboard: DashboardData;
};

function getTransactionValueClass(type: "INCOME" | "EXPENSE") {
  return type === "INCOME" ? "finance-income" : "finance-expense";
}

function getTransactionIcon(type: "INCOME" | "EXPENSE") {
  return type === "INCOME" ? ArrowUpCircle : ArrowDownCircle;
}

export function DashboardMobile({ dashboard }: DashboardMobileProps) {
  const lastTransactions = dashboard.recentTransactions.slice(0, 4);

  return (
    <div className="mobile-dashboard">
      <section className="mobile-balance-card">
        <div className="mobile-balance-card__top">
          <div>
            <p className="mobile-eyebrow">{dashboard.monthLabel}</p>
            <h2>Saldo real</h2>
          </div>

          <div className="mobile-balance-card__icon">
            <Wallet className="h-5 w-5" />
          </div>
        </div>

        <strong>{dashboard.balance}</strong>
      </section>

      <section className="mobile-finance-grid">
        <div className="mobile-finance-card">
          <span>Entradas</span>
          <strong className="finance-income">{dashboard.income}</strong>
          <small>{dashboard.incomeTransactionsCount} pagas</small>
        </div>

        <div className="mobile-finance-card">
          <span>Saidas</span>
          <strong className="finance-expense">{dashboard.expenses}</strong>
          <small>{dashboard.expenseTransactionsCount} pagas</small>
        </div>

        <Link
          href="/lancamentos?status=PENDING"
          className="mobile-finance-card mobile-finance-card--link"
        >
          <span>Pendentes</span>
          <strong>{dashboard.pendingBillsCount}</strong>
          <small>Ver lista</small>
        </Link>

        <Link
          href="/cartoes"
          className="mobile-finance-card mobile-finance-card--link"
        >
          <span>Cartoes</span>
          <strong>{dashboard.activeCardsCount}</strong>
          <small>Ativos</small>
        </Link>
      </section>

      <section className="mobile-quick-actions">
        <Link href="/lancamentos/novo" className="mobile-quick-action">
          <div>
            <Plus className="h-5 w-5" />
          </div>
          <span>Lancar</span>
        </Link>

        <Link href="/lancamentos" className="mobile-quick-action">
          <div>
            <ReceiptText className="h-5 w-5" />
          </div>
          <span>Transacoes</span>
        </Link>

        <Link href="/cartoes/faturas" className="mobile-quick-action">
          <div>
            <CreditCard className="h-5 w-5" />
          </div>
          <span>Faturas</span>
        </Link>

        <Link href="/metas" className="mobile-quick-action">
          <div>
            <Target className="h-5 w-5" />
          </div>
          <span>Metas</span>
        </Link>
      </section>

      <DashboardInsights
        largestExpense={dashboard.largestExpense}
        topExpenseCategory={dashboard.topExpenseCategory}
        upcomingPending={dashboard.upcomingPending}
      />

      <Link href="/lancamentos?status=PENDING" className="mobile-alert-card">
        <div className="mobile-alert-card__icon">
          <PiggyBank className="h-5 w-5" />
        </div>

        <div>
          <strong>{dashboard.pendingBillsCount} pendencias</strong>
          <p>Previsoes e contas aguardando pagamento.</p>
        </div>

        <ArrowRight className="h-4 w-4 text-white/35" />
      </Link>

      <section className="mobile-dashboard-charts">
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

      <section className="mobile-section">
        <div className="mobile-section__header">
          <div>
            <p className="mobile-eyebrow">Casal</p>
            <h3>Responsaveis</h3>
          </div>

          <Link href="/lancamentos" className="mobile-see-all">
            Ver todos
          </Link>
        </div>

        <div className="mobile-responsible-list">
          <Link href="/lancamentos" className="mobile-responsible-card main">
            <div className="mobile-responsible-card__top">
              <div>
                <span>Geral</span>
                <strong>Casal</strong>
              </div>

              <div className="mobile-responsible-card__avatar">
                <UsersRound className="h-5 w-5" />
              </div>
            </div>

            <b>{dashboard.balance}</b>

            <div className="mobile-responsible-card__rows">
              <span className="finance-income">{dashboard.income}</span>
              <span className="finance-expense">{dashboard.expenses}</span>
            </div>
          </Link>

          {dashboard.responsibleSummaries.map((summary, index) => (
            <Link
              key={`${summary.id}-${summary.name}-${index}`}
              href={`/lancamentos?responsibleId=${summary.id}`}
              className="mobile-responsible-card"
            >
              <div className="mobile-responsible-card__top">
                <div>
                  <span>Individual</span>
                  <strong>{summary.name}</strong>
                </div>

                <div className="mobile-responsible-card__avatar">
                  <UserRound className="h-5 w-5" />
                </div>
              </div>

              <b>{summary.balance}</b>

              <div className="mobile-responsible-card__rows">
                <span className="finance-income">{summary.income}</span>
                <span className="finance-expense">{summary.expenses}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="mobile-section">
        <div className="mobile-section__header">
          <div>
            <p className="mobile-eyebrow">Movimentos</p>
            <h3>Ultimos</h3>
          </div>

          <Link href="/lancamentos" className="mobile-see-all">
            Ver lista
          </Link>
        </div>

        <div className="mobile-transaction-list">
          {lastTransactions.length > 0 ? (
            lastTransactions.map((transaction) => {
              const Icon = getTransactionIcon(transaction.type);

              return (
                <Link
                  key={transaction.id}
                  href="/lancamentos"
                  className="mobile-transaction-card"
                >
                  <div className="mobile-transaction-card__icon">
                    <Icon className="h-5 w-5" />
                  </div>

                  <div className="mobile-transaction-card__content">
                    <strong>{transaction.description}</strong>
                    <span>
                      {transaction.category} &middot; {transaction.responsible}
                    </span>
                  </div>

                  <div className="mobile-transaction-card__value">
                    <strong className={getTransactionValueClass(transaction.type)}>
                      {transaction.amount}
                    </strong>
                    <span>{transaction.date}</span>
                  </div>
                </Link>
              );
            })
          ) : (
            <div className="mobile-empty-state">
              <strong>Nenhum lancamento</strong>
              <p>Comece registrando uma entrada ou saida.</p>
              <Link href="/lancamentos/novo">Criar lancamento</Link>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
