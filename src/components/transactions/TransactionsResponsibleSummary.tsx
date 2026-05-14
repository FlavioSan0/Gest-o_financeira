import Link from "next/link";
import { UserRound, UsersRound } from "lucide-react";

type ResponsibleSummaryCard = {
  id: string;
  name: string;
  income: string;
  expense: string;
  balance: string;
  transactionsCount: number;
  isGeneral: boolean;
};

type TransactionsResponsibleSummaryProps = {
  cards: ResponsibleSummaryCard[];
  activeResponsibleId: string;
};

export function TransactionsResponsibleSummary({
  cards,
  activeResponsibleId,
}: TransactionsResponsibleSummaryProps) {
  return (
    <section className="grid gap-4 xl:grid-cols-3">
      {cards.map((card) => {
        const Icon = card.isGeneral ? UsersRound : UserRound;
        const isActive =
          activeResponsibleId === card.id ||
          (activeResponsibleId === "ALL" && card.id === "ALL");

        const href =
          card.id === "ALL"
            ? "/lancamentos"
            : `/lancamentos?responsibleId=${card.id}`;

        return (
          <Link
            key={card.id}
            href={href}
            className={
              isActive
                ? "rounded-3xl border border-white/30 bg-white p-5 text-black shadow-[0_0_35px_rgba(255,255,255,0.14)] transition hover:scale-[1.01]"
                : "rounded-3xl border border-white/10 bg-black/25 p-5 text-white transition hover:border-white/20 hover:bg-white/4"
            }
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p
                  className={
                    isActive
                      ? "text-sm font-bold text-black/55"
                      : "text-sm font-bold app-faint-text"
                  }
                >
                  {card.isGeneral ? "Visão geral" : "Responsável"}
                </p>

                <h3
                  className={
                    isActive
                      ? "mt-1 text-xl font-black tracking-[-0.03em] text-black"
                      : "mt-1 text-xl font-black tracking-[-0.03em] text-white"
                  }
                >
                  {card.name}
                </h3>
              </div>

              <div
                className={
                  isActive
                    ? "flex h-12 w-12 items-center justify-center rounded-2xl bg-black text-white"
                    : "app-icon-box h-12 w-12"
                }
              >
                <Icon className="h-5 w-5" />
              </div>
            </div>

            <strong
              className={
                isActive
                  ? "mt-5 block text-3xl font-black tracking-[-0.04em] text-black"
                  : "mt-5 block text-3xl font-black tracking-[-0.04em] text-white"
              }
            >
              {card.balance}
            </strong>

            <div className="mt-5 grid gap-2 text-sm">
              <div className="flex items-center justify-between gap-3">
                <span className={isActive ? "text-black/55" : "app-faint-text"}>
                  Entradas
                </span>

                <strong className={isActive ? "text-emerald-600" : "finance-income"}>
                  {card.income}
                </strong>
              </div>

              <div className="flex items-center justify-between gap-3">
                <span className={isActive ? "text-black/55" : "app-faint-text"}>
                  Saídas
                </span>

                <strong className={isActive ? "text-red-600" : "finance-expense"}>
                  {card.expense}
                </strong>
              </div>

              <div className="flex items-center justify-between gap-3">
                <span className={isActive ? "text-black/55" : "app-faint-text"}>
                  Registros
                </span>

                <strong className={isActive ? "text-black" : "text-white"}>
                  {card.transactionsCount}
                </strong>
              </div>
            </div>
          </Link>
        );
      })}
    </section>
  );
}