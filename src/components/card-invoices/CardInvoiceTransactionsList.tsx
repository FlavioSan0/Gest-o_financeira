import { CalendarDays, CreditCard, UserRound } from "lucide-react";

type CardInvoiceTransaction = {
  id: string;
  description: string;
  amount: string;
  date: string;
  status: string;
  category: string;
  creditCard: string;
  responsible: string;
};

type CardInvoiceTransactionsListProps = {
  transactions: CardInvoiceTransaction[];
};

function getStatusLabel(status: string) {
  const labels: Record<string, string> = {
    PAID: "Pago",
    PENDING: "Pendente",
    OVERDUE: "Atrasado",
    CANCELED: "Cancelado",
  };

  return labels[status] ?? status;
}

function getStatusClassName(status: string) {
  const classes: Record<string, string> = {
    PAID: "finance-badge finance-badge-income",
    PENDING: "finance-badge finance-badge-pending",
    OVERDUE: "finance-badge finance-badge-expense",
    CANCELED: "finance-badge finance-badge-neutral",
  };

  return classes[status] ?? "finance-badge finance-badge-neutral";
}

export function CardInvoiceTransactionsList({
  transactions,
}: CardInvoiceTransactionsListProps) {
  const hasTransactions = transactions.length > 0;

  return (
    <section className="app-card p-6">
      <div className="flex flex-col justify-between gap-4 border-b border-white/10 pb-5 md:flex-row md:items-center">
        <div>
          <h3 className="text-xl font-black tracking-[-0.03em] text-white">
            Compras da fatura
          </h3>

          <p className="mt-1 text-sm app-faint-text">
            Compras feitas no cartão de crédito dentro do período selecionado.
          </p>
        </div>

        <span className="finance-badge finance-badge-card">
          {transactions.length} registros
        </span>
      </div>

      {!hasTransactions && (
        <div className="mt-6 flex min-h-65 flex-col items-center justify-center rounded-[1.75rem] border border-dashed border-white/15 bg-black/25 p-8 text-center">
          <div className="app-icon-box h-16 w-16 rounded-3xl">
            <CreditCard className="h-8 w-8" />
          </div>

          <h3 className="mt-5 text-lg font-bold text-white">
            Nenhuma compra encontrada
          </h3>

          <p className="mt-2 max-w-md text-sm leading-6 app-faint-text">
            Cadastre uma saída usando cartão de crédito para ela aparecer nesta
            fatura.
          </p>
        </div>
      )}

      {hasTransactions && (
        <div className="mt-5 grid gap-3">
          {transactions.map((transaction) => (
            <article
              key={transaction.id}
              className="rounded-3xl border border-white/10 bg-black/25 p-4 transition hover:border-white/20 hover:bg-white/4"
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <strong className="text-base font-black text-white">
                      {transaction.description}
                    </strong>

                    <span className="finance-badge finance-badge-card">
                      Cartão
                    </span>

                    <span className={getStatusClassName(transaction.status)}>
                      {getStatusLabel(transaction.status)}
                    </span>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-xs app-faint-text">
                    <span className="inline-flex items-center gap-1.5">
                      <CalendarDays className="h-3.5 w-3.5" />
                      {transaction.date}
                    </span>

                    <span className="inline-flex items-center gap-1.5">
                      <CreditCard className="h-3.5 w-3.5" />
                      {transaction.creditCard}
                    </span>

                    <span>{transaction.category}</span>

                    <span className="inline-flex items-center gap-1.5">
                      <UserRound className="h-3.5 w-3.5" />
                      {transaction.responsible}
                    </span>
                  </div>
                </div>

                <strong className="text-xl font-black finance-credit-card">
                  {transaction.amount}
                </strong>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}