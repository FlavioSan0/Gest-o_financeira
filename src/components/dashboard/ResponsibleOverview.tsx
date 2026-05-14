import { UserRound, UsersRound, Wallet } from "lucide-react";

type ResponsibleSummary = {
  userId: string;
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
    <section className="app-card p-6">
      <div className="flex flex-col justify-between gap-4 border-b border-white/10 pb-5 md:flex-row md:items-center">
        <div>
          <h2 className="text-xl font-black tracking-[-0.03em] text-white">
            Saldo por responsável
          </h2>

          <p className="mt-1 text-sm app-faint-text">
            Veja o resultado separado por pessoa e o total do casal.
          </p>
        </div>

        <span className="finance-badge border border-white/10 bg-white/5 text-white/70">
          Visão do mês atual
        </span>
      </div>

      <div className="mt-6 grid gap-4 xl:grid-cols-3">
        <article className="rounded-3xl border border-white/10 bg-white p-5 text-black shadow-[0_0_35px_rgba(255,255,255,0.12)]">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-bold text-black/55">Casal</p>

              <strong className="mt-2 block text-3xl font-black tracking-[-0.04em]">
                {totalBalance}
              </strong>
            </div>

            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-black text-white">
              <UsersRound className="h-6 w-6" />
            </div>
          </div>

          <div className="mt-5 grid gap-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-black/55">Entradas</span>
              <strong className="text-emerald-600">{totalIncome}</strong>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-black/55">Saídas</span>
              <strong className="text-red-600">{totalExpenses}</strong>
            </div>
          </div>
        </article>

        {responsibleSummaries.map((person) => (
          <article
            key={person.userId}
            className="rounded-3xl border border-white/10 bg-black/25 p-5"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-bold app-faint-text">
                  Saldo individual
                </p>

                <strong className="mt-2 block text-3xl font-black tracking-[-0.04em] text-white">
                  {person.balance}
                </strong>
              </div>

              <div className="app-icon-box h-12 w-12">
                <UserRound className="h-5 w-5" />
              </div>
            </div>

            <div className="mt-5">
              <div className="flex items-center gap-2">
                <Wallet className="h-4 w-4 text-white/50" />

                <h3 className="text-base font-black text-white">
                  {person.name}
                </h3>
              </div>

              <div className="mt-4 grid gap-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="app-faint-text">Entradas</span>
                  <strong className="finance-income">{person.income}</strong>
                </div>

                <div className="flex items-center justify-between">
                  <span className="app-faint-text">Saídas</span>
                  <strong className="finance-expense">{person.expenses}</strong>
                </div>

                <div className="flex items-center justify-between">
                  <span className="app-faint-text">Lançamentos</span>
                  <strong className="text-white">
                    {person.transactionsCount}
                  </strong>
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}