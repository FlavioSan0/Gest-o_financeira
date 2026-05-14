import { CalendarClock, CreditCard, ReceiptText, WalletCards } from "lucide-react";

type CardInvoiceOverviewProps = {
  monthLabel: string;
  overview: {
    totalAmount: string;
    totalTransactions: number;
    selectedCardName: string;
    paidAmount: string;
    pendingAmount: string;
  };
};

export function CardInvoiceOverview({
  monthLabel,
  overview,
}: CardInvoiceOverviewProps) {
  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <article className="app-card-light p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-bold text-black/55">
              Total da fatura
            </p>

            <strong className="mt-2 block text-2xl font-black text-black">
              {overview.totalAmount}
            </strong>
          </div>

          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-black text-white">
            <CreditCard className="h-5 w-5" />
          </div>
        </div>
      </article>

      <article className="app-card p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-bold app-faint-text">Cartão</p>

            <strong className="mt-2 block text-2xl font-black text-white">
              {overview.selectedCardName}
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
            <p className="text-sm font-bold app-faint-text">Período</p>

            <strong className="mt-2 block text-2xl font-black text-white">
              {monthLabel}
            </strong>
          </div>

          <div className="app-icon-box h-11 w-11">
            <CalendarClock className="h-5 w-5" />
          </div>
        </div>
      </article>

      <article className="app-card p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-bold app-faint-text">Compras</p>

            <strong className="mt-2 block text-2xl font-black finance-credit-card">
              {overview.totalTransactions}
            </strong>
          </div>

          <div className="app-icon-box h-11 w-11">
            <ReceiptText className="h-5 w-5" />
          </div>
        </div>
      </article>
    </section>
  );
}