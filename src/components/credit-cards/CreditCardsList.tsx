import {
  CalendarClock,
  CreditCard,
  Landmark,
  Layers3,
  WalletCards,
} from "lucide-react";
import { ToggleCreditCardButton } from "./ToggleCreditCardButton";

type CreditCardItem = {
  id: string;
  name: string;
  bank: string;
  limitAmount: string;
  rawLimitAmount: number;
  closingDay: number;
  dueDay: number;
  active: boolean;
};

type CreditCardsListProps = {
  creditCards: CreditCardItem[];
  summary: {
    total: number;
    active: number;
    inactive: number;
    totalLimit: string;
  };
};

export function CreditCardsList({
  creditCards,
  summary,
}: CreditCardsListProps) {
  const hasCards = creditCards.length > 0;

  return (
    <div className="grid gap-6">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <article className="app-card p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-bold app-faint-text">Limite total</p>
              <strong className="mt-2 block text-2xl font-black text-white">
                {summary.totalLimit}
              </strong>
            </div>

            <div className="app-icon-box h-11 w-11">
              <CreditCard className="h-5 w-5" />
            </div>
          </div>
        </article>

        <article className="app-card p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-bold app-faint-text">Cartões ativos</p>
              <strong className="mt-2 block text-2xl font-black finance-credit-card">
                {summary.active}
              </strong>
            </div>

            <div className="app-icon-box h-11 w-11">
              <WalletCards className="h-5 w-5" />
            </div>
          </div>
        </article>

        <article className="app-card p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-bold app-faint-text">Inativos</p>
              <strong className="mt-2 block text-2xl font-black finance-pending">
                {summary.inactive}
              </strong>
            </div>

            <div className="app-icon-box h-11 w-11">
              <Layers3 className="h-5 w-5" />
            </div>
          </div>
        </article>

        <article className="app-card p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-bold app-faint-text">Total</p>
              <strong className="mt-2 block text-2xl font-black text-white">
                {summary.total}
              </strong>
            </div>

            <div className="app-icon-box h-11 w-11">
              <Landmark className="h-5 w-5" />
            </div>
          </div>
        </article>
      </section>

      <section className="app-card p-6">
        <div className="flex flex-col justify-between gap-4 border-b border-white/10 pb-5 md:flex-row md:items-center">
          <div>
            <h3 className="text-xl font-black tracking-[-0.03em] text-white">
              Cartões cadastrados
            </h3>

            <p className="mt-1 text-sm app-faint-text">
              Controle cartões, limites, fechamento e vencimento.
            </p>
          </div>

          <span className="finance-badge finance-badge-card">
            Cartões de crédito
          </span>
        </div>

        {!hasCards && (
          <div className="mt-6 flex min-h-65 flex-col items-center justify-center rounded-[1.75rem] border border-dashed border-white/15 bg-black/25 p-8 text-center">
            <div className="app-icon-box h-16 w-16 rounded-3xl">
              <CreditCard className="h-8 w-8" />
            </div>

            <h3 className="mt-5 text-lg font-bold text-white">
              Nenhum cartão cadastrado
            </h3>

            <p className="mt-2 max-w-md text-sm leading-6 app-faint-text">
              Cadastre cartões para acompanhar limites, vencimentos e faturas
              futuramente.
            </p>
          </div>
        )}

        {hasCards && (
          <div className="mt-5 grid gap-3">
            {creditCards.map((card) => (
              <article
                key={card.id}
                className={
                  card.active
                    ? "rounded-3xl border border-white/10 bg-black/25 p-4 transition hover:border-white/20 hover:bg-white/4"
                    : "rounded-3xl border border-white/5 bg-black/15 p-4 opacity-55"
                }
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex min-w-0 items-center gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-purple-500/20 bg-purple-500/10 text-purple-400">
                      <CreditCard className="h-5 w-5" />
                    </div>

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <strong className="text-base font-black text-white">
                          {card.name}
                        </strong>

                        <span className="finance-badge finance-badge-card">
                          {card.bank}
                        </span>

                        {!card.active && (
                          <span className="finance-badge finance-badge-neutral">
                            Inativo
                          </span>
                        )}
                      </div>

                      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-2 text-xs app-faint-text">
                        <span>Limite: {card.limitAmount}</span>

                        <span className="inline-flex items-center gap-1.5">
                          <CalendarClock className="h-3.5 w-3.5" />
                          Fecha dia {card.closingDay}
                        </span>

                        <span>Vence dia {card.dueDay}</span>
                      </div>
                    </div>
                  </div>

                  <ToggleCreditCardButton
                    creditCardId={card.id}
                    creditCardName={card.name}
                    active={card.active}
                  />
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}