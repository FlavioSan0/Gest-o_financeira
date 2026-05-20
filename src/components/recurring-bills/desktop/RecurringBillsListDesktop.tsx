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

type RecurringBillsListDesktopProps = {
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

  return `Vence em ${daysUntilDue} dias`;
}

function getDueStatusClassName(daysUntilDue: number) {
  if (daysUntilDue < 0) return "finance-badge finance-badge-expense";
  if (daysUntilDue <= 5) return "finance-badge finance-badge-pending";

  return "finance-badge border border-white/10 bg-white/5 text-white/70";
}

export function RecurringBillsListDesktop({
  recurringBills,
  summary,
}: RecurringBillsListDesktopProps) {
  const hasRecurringBills = recurringBills.length > 0;

  return (
    <div className="grid gap-6">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <article className="app-card p-5">
          <p className="text-sm font-bold app-faint-text">Previsão mensal</p>
          <strong className="mt-2 block text-2xl font-black text-white">
            {summary.monthlyForecast}
          </strong>
        </article>

        <article className="app-card p-5">
          <p className="text-sm font-bold app-faint-text">Contas fixas</p>
          <strong className="mt-2 block text-2xl font-black text-white">
            {summary.total}
          </strong>
        </article>

        <article className="app-card p-5">
          <p className="text-sm font-bold app-faint-text">Ativas</p>
          <strong className="mt-2 block text-2xl font-black finance-income">
            {summary.active}
          </strong>
        </article>

        <article className="app-card p-5">
          <p className="text-sm font-bold app-faint-text">Inativas</p>
          <strong className="mt-2 block text-2xl font-black finance-pending">
            {summary.inactive}
          </strong>
        </article>
      </section>

      <section className="app-card p-6">
        <div className="flex flex-col justify-between gap-4 border-b border-white/10 pb-5 md:flex-row md:items-center">
          <div>
            <h3 className="text-xl font-black tracking-[-0.03em] text-white">
              Contas fixas cadastradas
            </h3>

            <p className="mt-1 text-sm app-faint-text">
              Gere lançamentos mensais quando quiser acompanhar ou pagar.
            </p>
          </div>

          <span className="finance-badge border border-white/10 bg-white/5 text-white/70">
            {summary.total} registros
          </span>
        </div>

        {!hasRecurringBills && (
          <div className="mt-6 flex min-h-65 flex-col items-center justify-center rounded-[1.75rem] border border-dashed border-white/15 bg-black/25 p-8 text-center">
            <div className="app-icon-box h-16 w-16 rounded-3xl">
              <Repeat className="h-8 w-8" />
            </div>

            <h3 className="mt-5 text-lg font-bold text-white">
              Nenhuma conta fixa cadastrada
            </h3>

            <p className="mt-2 max-w-md text-sm leading-6 app-faint-text">
              Cadastre despesas mensais para prever seu mês financeiro.
            </p>
          </div>
        )}

        {hasRecurringBills && (
          <div className="mt-5 grid gap-3">
            {recurringBills.map((bill) => (
              <article
                key={bill.id}
                className={
                  bill.active
                    ? "rounded-3xl border border-white/10 bg-black/25 p-4 transition hover:border-white/20 hover:bg-white/4"
                    : "rounded-3xl border border-white/5 bg-black/15 p-4 opacity-55"
                }
              >
                <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                  <div className="flex min-w-0 items-center gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-white">
                      <WalletCards className="h-5 w-5" />
                    </div>

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <strong className="text-base font-black text-white">
                          {bill.description}
                        </strong>

                        <span className={getDueStatusClassName(bill.daysUntilDue)}>
                          {getDueStatusLabel(bill.daysUntilDue)}
                        </span>

                        {!bill.active && (
                          <span className="finance-badge finance-badge-neutral">
                            Inativa
                          </span>
                        )}

                        {bill.alreadyGeneratedThisMonth && (
                          <span className="finance-badge finance-badge-income">
                            Gerada no mês
                          </span>
                        )}
                      </div>

                      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-2 text-xs app-faint-text">
                        <span className="inline-flex items-center gap-1.5">
                          <CalendarDays className="h-3.5 w-3.5" />
                          Vencimento: dia {bill.dueDay} • {bill.nextDueDate}
                        </span>

                        <span>{bill.category}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3 xl:justify-end">
                    <strong className="text-xl font-black finance-expense">
                      {bill.amount}
                    </strong>

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
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}