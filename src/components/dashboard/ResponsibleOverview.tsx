import Link from "next/link";
import { UserRound, UsersRound, WalletCards } from "lucide-react";

type ResponsibleSummary = {
  id: string;
  name: string;
  income: string;
  expenses: string;
  balance: string;
  transactionsCount: number;
};

type ResponsibleOverviewProps = {
  totalBalance: string;
  totalIncome: string;
  totalExpenses: string;
  responsibleSummaries: ResponsibleSummary[];
};

export function ResponsibleOverview({
  totalBalance,
  totalIncome,
  totalExpenses,
  responsibleSummaries,
}: ResponsibleOverviewProps) {
  return (
    <section className="responsible-overview">
      <Link href="/lancamentos" className="responsible-card responsible-card--main">
        <div className="responsible-card__top">
          <div>
            <p className="responsible-card__eyebrow">Visão geral</p>
            <h3 className="responsible-card__title">Casal</h3>
          </div>

          <div className="responsible-card__icon responsible-card__icon--dark">
            <UsersRound className="h-5 w-5" />
          </div>
        </div>

        <strong className="responsible-card__balance">{totalBalance}</strong>

        <div className="responsible-card__rows">
          <div>
            <span>Entradas</span>
            <strong className="finance-income">{totalIncome}</strong>
          </div>

          <div>
            <span>Saídas</span>
            <strong className="finance-expense">{totalExpenses}</strong>
          </div>
        </div>
      </Link>

      <div className="responsible-card-list">
        {responsibleSummaries.map((summary, index) => {
          const responsibleKey = summary.id
            ? `${summary.id}-${summary.name}`
            : `responsible-${index}-${summary.name}`;

          const responsibleHref = summary.id
            ? `/lancamentos?responsibleId=${summary.id}`
            : "/lancamentos";

          return (
            <Link
              key={responsibleKey}
              href={responsibleHref}
              className="responsible-card"
            >
              <div className="responsible-card__top">
                <div>
                  <p className="responsible-card__eyebrow">Saldo individual</p>
                  <h3 className="responsible-card__title">{summary.name}</h3>
                </div>

                <div className="responsible-card__icon">
                  <UserRound className="h-5 w-5" />
                </div>
              </div>

              <strong className="responsible-card__balance">
                {summary.balance}
              </strong>

              <div className="responsible-card__rows">
                <div>
                  <span>Entradas</span>
                  <strong className="finance-income">{summary.income}</strong>
                </div>

                <div>
                  <span>Saídas</span>
                  <strong className="finance-expense">
                    {summary.expenses}
                  </strong>
                </div>
              </div>

              <div className="responsible-card__footer">
                <WalletCards className="h-4 w-4" />
                <span>
                  {summary.transactionsCount}{" "}
                  {summary.transactionsCount === 1
                    ? "lançamento"
                    : "lançamentos"}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}