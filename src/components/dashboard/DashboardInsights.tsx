import Link from "next/link";
import {
  ArrowRight,
  CalendarClock,
  Flame,
  Tags,
  WalletCards,
} from "lucide-react";
import type { CategoryExpenseSummary } from "@/services/dashboard-service";

type LargestExpenseInsight = {
  id: string;
  description: string;
  formattedAmount: string;
  date: string;
  categoryName: string;
} | null;

type UpcomingPendingInsight = {
  id: string;
  description: string;
  formattedAmount: string;
  dueDate: string;
  categoryName: string;
}[];

type DashboardInsightsProps = {
  largestExpense: LargestExpenseInsight;
  topExpenseCategory: CategoryExpenseSummary | null;
  upcomingPending: UpcomingPendingInsight;
};

export function DashboardInsights({
  largestExpense,
  topExpenseCategory,
  upcomingPending,
}: DashboardInsightsProps) {
  const nextPending = upcomingPending.slice(0, 3);

  return (
    <section className="dashboard-insights-grid">
      <article className="app-card dashboard-insight-card">
        <div className="dashboard-insight-card__top">
          <div className="dashboard-insight-card__icon">
            <Flame className="h-5 w-5" />
          </div>
          <span>Maior despesa</span>
        </div>

        {largestExpense ? (
          <>
            <strong className="dashboard-insight-card__value finance-expense">
              {largestExpense.formattedAmount}
            </strong>
            <p>{largestExpense.description}</p>
            <small>
              {largestExpense.categoryName} &middot; {largestExpense.date}
            </small>
          </>
        ) : (
          <>
            <strong className="dashboard-insight-card__value">R$ 0,00</strong>
            <p>Nenhuma despesa PAID no m&ecirc;s.</p>
          </>
        )}
      </article>

      <article className="app-card dashboard-insight-card">
        <div className="dashboard-insight-card__top">
          <div className="dashboard-insight-card__icon">
            <Tags className="h-5 w-5" />
          </div>
          <span>Categoria l&iacute;der</span>
        </div>

        {topExpenseCategory ? (
          <>
            <strong className="dashboard-insight-card__value">
              {topExpenseCategory.categoryName}
            </strong>
            <p>{topExpenseCategory.formattedAmount}</p>
            <small>
              {topExpenseCategory.percentage.toLocaleString("pt-BR")}% das
              despesas PAID
            </small>
          </>
        ) : (
          <>
            <strong className="dashboard-insight-card__value">Sem dados</strong>
            <p>Registre despesas pagas para ver o destaque.</p>
          </>
        )}
      </article>

      <article className="app-card dashboard-insight-card dashboard-insight-card--wide">
        <div className="dashboard-insight-card__header">
          <div className="dashboard-insight-card__top">
            <div className="dashboard-insight-card__icon">
              <CalendarClock className="h-5 w-5" />
            </div>
            <span>Pr&oacute;ximos vencimentos</span>
          </div>

          <Link href="/lancamentos?status=PENDING">
            Ver pendentes
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {nextPending.length > 0 ? (
          <div className="dashboard-pending-list">
            {nextPending.map((pending) => (
              <Link
                key={pending.id}
                href="/lancamentos?status=PENDING"
                className="dashboard-pending-item"
              >
                <div className="dashboard-pending-item__icon">
                  <WalletCards className="h-4 w-4" />
                </div>

                <div className="min-w-0">
                  <strong>{pending.description}</strong>
                  <span>
                    {pending.categoryName} &middot; {pending.dueDate}
                  </span>
                </div>

                <b>{pending.formattedAmount}</b>
              </Link>
            ))}
          </div>
        ) : (
          <div className="dashboard-pending-empty">
            Sem vencimentos PENDING proximos.
          </div>
        )}
      </article>
    </section>
  );
}
