import { CalendarDays, CircleDollarSign, Repeat, WalletCards } from "lucide-react";
import { ToggleRecurringBillButton } from "@/components/recurring-bills/ToggleRecurringBillButton";
import { GenerateRecurringTransactionButton } from "@/components/recurring-bills/GenerateRecurringTransactionButton";

type RecurringBillItem = {
  id: string;
  description: string;
  amount: string;
  rawAmount: number;
  dueDay: number;
  frequency: string;
  active: boolean;
  category: string;
  categoryColor: string;
  categoryIcon: string;
  nextDueDate: string;
  daysUntilDue: number;
  alreadyGeneratedThisMonth: boolean;
};

type RecurringBillsListMobileProps = {
  recurringBills: RecurringBillItem[];
  summary: {
    total: number;
    active: number;
    inactive: number;
    monthlyForecast: string;
  };
};

function getDueStatusLabel(daysUntilDue: number) {
  if (daysUntilDue < 0) return "Vencida";
  if (daysUntilDue === 0) return "Vence hoje";
  if (daysUntilDue <= 5) return `Vence em ${daysUntilDue} dias`;

  return `Em ${daysUntilDue} dias`;
}

export function RecurringBillsListMobile({
  recurringBills,
  summary,
}: RecurringBillsListMobileProps) {
  const hasRecurringBills = recurringBills.length > 0;

  return (
    <div className="mobile-recurring">
      <section className="mobile-recurring-summary">
        <div className="mobile-recurring-summary__top">
          <div>
            <span>Previsão mensal</span>
            <strong>{summary.monthlyForecast}</strong>
          </div>

          <div className="mobile-recurring-summary__icon">
            <CircleDollarSign className="h-5 w-5" />
          </div>
        </div>

        <div className="mobile-recurring-summary__grid">
          <div>
            <span>Ativas</span>
            <b className="finance-income">{summary.active}</b>
          </div>

          <div>
            <span>Inativas</span>
            <b className="finance-pending">{summary.inactive}</b>
          </div>
        </div>
      </section>

      {!hasRecurringBills && (
        <section className="mobile-section">
          <div className="mobile-empty-state">
            <strong>Nenhuma conta fixa cadastrada</strong>
            <p>Cadastre despesas mensais para prever seu mês financeiro.</p>
          </div>
        </section>
      )}

      {hasRecurringBills && (
        <section className="mobile-section">
          <div className="mobile-section__header">
            <div>
              <p className="mobile-eyebrow">Recorrentes</p>
              <h3>Contas fixas</h3>
            </div>

            <span className="mobile-recurring-counter">
              {summary.total}
            </span>
          </div>

          <div className="mobile-recurring-list">
            {recurringBills.map((bill) => (
              <article
                key={bill.id}
                className={
                  bill.active
                    ? "mobile-recurring-card"
                    : "mobile-recurring-card mobile-recurring-card--inactive"
                }
              >
                <div className="mobile-recurring-card__top">
                  <div className="mobile-recurring-card__icon">
                    <WalletCards className="h-5 w-5" />
                  </div>

                  <div className="mobile-recurring-card__title">
                    <strong>{bill.description}</strong>
                    <span>{bill.category}</span>
                  </div>
                </div>

                <div className="mobile-recurring-card__amount">
                  <span>Valor previsto</span>
                  <strong>{bill.amount}</strong>
                </div>

                <div className="mobile-recurring-card__meta">
                  <span>
                    <CalendarDays className="h-3.5 w-3.5" />
                    Dia {bill.dueDay} • {bill.nextDueDate}
                  </span>

                  <b>{getDueStatusLabel(bill.daysUntilDue)}</b>
                </div>

                <div className="mobile-recurring-card__badges">
                  {!bill.active && (
                    <span className="mobile-recurring-card__badge">
                      Inativa
                    </span>
                  )}

                  {bill.alreadyGeneratedThisMonth && (
                    <span className="mobile-recurring-card__badge mobile-recurring-card__badge--success">
                      Gerada no mês
                    </span>
                  )}
                </div>

                <div className="mobile-recurring-card__actions">
                  <GenerateRecurringTransactionButton
                    recurringBillId={bill.id}
                    disabled={!bill.active || bill.alreadyGeneratedThisMonth}
                    alreadyGenerated={bill.alreadyGeneratedThisMonth}
                  />

                  <ToggleRecurringBillButton
                    recurringBillId={bill.id}
                    recurringBillDescription={bill.description}
                    active={bill.active}
                  />
                </div>
              </article>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}