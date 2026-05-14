import Link from "next/link";
import { CreditCard, Plus } from "lucide-react";

type RecentTransaction = {
  id: string;
  description: string;
  amount: string;
  type: "INCOME" | "EXPENSE";
  status: string;
  date: string;
  category: string;
  responsible: string;
};

type RecentTransactionsProps = {
  transactions: RecentTransaction[];
};

export function RecentTransactions({ transactions }: RecentTransactionsProps) {
  const hasTransactions = transactions.length > 0;

  return (
    <article className="app-card p-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h2 className="text-xl font-bold tracking-[-0.02em] text-white">
            Lançamentos recentes
          </h2>

          <p className="mt-1 text-sm app-faint-text">
            Suas últimas movimentações aparecerão aqui.
          </p>
        </div>

        <Link href="/lancamentos/novo" className="app-button-secondary w-full md:w-auto">
          <Plus className="h-4 w-4" />
          Adicionar
        </Link>
      </div>

      {!hasTransactions && (
        <div className="mt-8 flex min-h-65 flex-col items-center justify-center rounded-[1.75rem] border border-dashed border-white/15 bg-black/25 p-8 text-center">
          <div className="app-icon-box h-16 w-16 rounded-3xl">
            <CreditCard className="h-8 w-8" />
          </div>

          <h3 className="mt-5 text-lg font-bold text-white">
            Nenhum lançamento cadastrado
          </h3>

          <p className="mt-2 max-w-md text-sm leading-6 app-faint-text">
            Comece registrando uma entrada, uma despesa ou uma conta fixa para
            acompanhar seu mês com clareza.
          </p>
        </div>
      )}

      {hasTransactions && (
        <div className="mt-6 grid gap-3">
          {transactions.map((transaction) => (
            <div
              key={transaction.id}
              className="flex flex-col gap-4 rounded-3xl border border-white/10 bg-black/25 p-4 md:flex-row md:items-center md:justify-between"
            >
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <strong className="text-sm text-white">
                    {transaction.description}
                  </strong>

                  <span
                    className={
                      transaction.type === "INCOME"
                        ? "finance-badge finance-badge-income"
                        : "finance-badge finance-badge-expense"
                    }
                  >
                    {transaction.type === "INCOME" ? "Entrada" : "Saída"}
                  </span>
                </div>

                <p className="mt-2 text-xs app-faint-text">
                  {transaction.category} • {transaction.responsible} •{" "}
                  {transaction.date}
                </p>
              </div>

              <strong
                className={
                  transaction.type === "INCOME"
                    ? "text-lg font-black finance-income"
                    : "text-lg font-black finance-expense"
                }
              >
                {transaction.type === "INCOME" ? "+" : "-"}{" "}
                {transaction.amount}
              </strong>
            </div>
          ))}
        </div>
      )}
    </article>
  );
}