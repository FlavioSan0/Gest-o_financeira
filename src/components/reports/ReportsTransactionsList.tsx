import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import type { ReportsData } from "@/services/reports-service";

type ReportsTransactionsListProps = {
  transactions: ReportsData["recentTransactions"];
};

function getStatusTone(status: ReportsData["recentTransactions"][number]["status"]) {
  if (status === "PAID") {
    return "border-emerald-400/30 bg-emerald-400/10 text-emerald-100";
  }

  if (status === "PENDING") {
    return "border-amber-400/30 bg-amber-400/10 text-amber-100";
  }

  return "border-white/10 bg-white/5 text-white";
}

export function ReportsTransactionsList({
  transactions,
}: ReportsTransactionsListProps) {
  return (
    <section className="app-card p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] app-faint-text">
            Lista
          </p>
          <h3 className="mt-1 text-lg font-black text-white">
            Ultimos lancamentos
          </h3>
        </div>
        <span className="text-xs app-muted-text">max. 10</span>
      </div>

      {transactions.length === 0 ? (
        <div className="grid min-h-32 place-items-center rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-5 text-center">
          <p className="text-sm app-muted-text">
            Nenhum lancamento encontrado no periodo.
          </p>
        </div>
      ) : (
        <div className="grid gap-3">
          {transactions.map((transaction) => {
            const Icon =
              transaction.type === "INCOME" ? ArrowUpRight : ArrowDownRight;

            return (
              <article
                key={transaction.id}
                className="grid gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4 md:grid-cols-[1fr_auto]"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <Icon
                      className={
                        transaction.type === "INCOME"
                          ? "h-4 w-4 text-emerald-200"
                          : "h-4 w-4 text-rose-200"
                      }
                    />
                    <h4 className="truncate text-sm font-black text-white">
                      {transaction.description}
                    </h4>
                  </div>

                  <div className="mt-2 flex flex-wrap gap-2 text-xs app-muted-text">
                    <span>{transaction.category}</span>
                    <span>{transaction.responsible}</span>
                    <span>{transaction.date}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3 md:flex-col md:items-end">
                  <strong
                    className={
                      transaction.type === "INCOME"
                        ? "text-emerald-200"
                        : "text-rose-200"
                    }
                  >
                    {transaction.amount}
                  </strong>
                  <span
                    className={`rounded-full border px-3 py-1 text-[0.68rem] font-black ${getStatusTone(
                      transaction.status,
                    )}`}
                  >
                    {transaction.statusLabel}
                  </span>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
