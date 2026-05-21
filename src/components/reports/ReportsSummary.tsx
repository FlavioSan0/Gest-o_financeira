import { ArrowDownRight, ArrowUpRight, Clock3, ReceiptText, Scale } from "lucide-react";
import type { ReportsData } from "@/services/reports-service";

type ReportsSummaryProps = {
  summary: ReportsData["summary"];
};

const cards = [
  {
    key: "paidIncome",
    label: "Receitas",
    detail: "Realizadas",
    icon: ArrowUpRight,
    tone: "text-emerald-200",
  },
  {
    key: "paidExpense",
    label: "Despesas",
    detail: "Realizadas",
    icon: ArrowDownRight,
    tone: "text-rose-200",
  },
  {
    key: "realBalance",
    label: "Saldo real",
    detail: "Paid",
    icon: Scale,
    tone: "text-cyan-200",
  },
  {
    key: "pendingForecast",
    label: "Previsao",
    detail: "Pendentes",
    icon: Clock3,
    tone: "text-amber-200",
  },
] as const;

export function ReportsSummary({ summary }: ReportsSummaryProps) {
  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
      {cards.map((card) => {
        const Icon = card.icon;

        return (
          <article key={card.key} className="app-card p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] app-faint-text">
                  {card.label}
                </p>
                <strong className={`mt-2 block text-2xl font-black ${card.tone}`}>
                  {summary[card.key]}
                </strong>
              </div>

              <div className="app-icon-box h-11 w-11">
                <Icon className="h-5 w-5" />
              </div>
            </div>
            <span className="mt-2 block text-xs app-muted-text">
              {card.detail}
            </span>
          </article>
        );
      })}

      <article className="app-card p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] app-faint-text">
              Lancamentos
            </p>
            <strong className="mt-2 block text-2xl font-black text-white">
              {summary.transactionsCount}
            </strong>
          </div>

          <div className="app-icon-box h-11 w-11">
            <ReceiptText className="h-5 w-5" />
          </div>
        </div>
        <span className="mt-2 block text-xs app-muted-text">
          No periodo
        </span>
      </article>
    </section>
  );
}
