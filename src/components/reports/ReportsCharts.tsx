import type { ReportsData } from "@/services/reports-service";

type ReportsChartsProps = {
  charts: ReportsData["charts"];
  summary: ReportsData["summary"];
};

function EmptyChart({ label }: { label: string }) {
  return (
    <div className="grid min-h-40 place-items-center rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-5 text-center">
      <p className="text-sm app-muted-text">{label}</p>
    </div>
  );
}

function HorizontalBars({
  items,
  tone = "bg-cyan-300",
}: {
  items: { id: string; label: string; formattedAmount: string; percentage: number }[];
  tone?: string;
}) {
  if (items.length === 0) {
    return <EmptyChart label="Sem dados para este filtro." />;
  }

  return (
    <div className="grid gap-3">
      {items.map((item) => (
        <div key={item.id} className="grid gap-2">
          <div className="flex items-center justify-between gap-3 text-sm">
            <span className="truncate font-bold text-white">{item.label}</span>
            <span className="shrink-0 app-muted-text">{item.formattedAmount}</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-white/10">
            <div
              className={`h-full rounded-full ${tone}`}
              style={{ width: `${Math.max(item.percentage, 4)}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

export function ReportsCharts({ charts, summary }: ReportsChartsProps) {
  return (
    <section className="grid gap-4 xl:grid-cols-2">
      <article className="app-card p-5">
        <div className="mb-4">
          <p className="text-xs font-bold uppercase tracking-[0.18em] app-faint-text">
            Categorias
          </p>
          <h3 className="mt-1 text-lg font-black text-white">
            Despesas por categoria
          </h3>
        </div>

        <HorizontalBars items={charts.expensesByCategory.slice(0, 8)} tone="bg-rose-300" />
      </article>

      <article className="app-card p-5">
        <div className="mb-4">
          <p className="text-xs font-bold uppercase tracking-[0.18em] app-faint-text">
            Realizado
          </p>
          <h3 className="mt-1 text-lg font-black text-white">
            Receitas x despesas
          </h3>
        </div>

        <div className="grid gap-3">
          {charts.incomeVsExpense.map((item) => (
            <div key={item.label} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm font-bold text-white">{item.label}</span>
                <strong className={item.tone === "income" ? "text-emerald-200" : "text-rose-200"}>
                  {item.formattedAmount}
                </strong>
              </div>
              <div className="mt-3 h-3 overflow-hidden rounded-full bg-white/10">
                <div
                  className={
                    item.tone === "income"
                      ? "h-full rounded-full bg-emerald-300"
                      : "h-full rounded-full bg-rose-300"
                  }
                  style={{ width: `${Math.max(item.percentage, item.amount > 0 ? 4 : 0)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </article>

      <article className="app-card p-5">
        <div className="mb-4">
          <p className="text-xs font-bold uppercase tracking-[0.18em] app-faint-text">
            Familia
          </p>
          <h3 className="mt-1 text-lg font-black text-white">
            Despesas por responsavel
          </h3>
        </div>

        <HorizontalBars items={charts.expensesByResponsible} tone="bg-cyan-300" />
      </article>

      <article className="app-card p-5">
        <div className="mb-4">
          <p className="text-xs font-bold uppercase tracking-[0.18em] app-faint-text">
            Evolucao
          </p>
          <h3 className="mt-1 text-lg font-black text-white">Movimento do mes</h3>
        </div>

        {charts.monthEvolution.length > 0 ? (
          <div className="grid gap-3">
            {charts.monthEvolution.map((item) => (
              <div key={item.day} className="grid grid-cols-[2.5rem_1fr_auto] items-center gap-3 text-sm">
                <span className="font-black text-white">D{item.day}</span>
                <div className="h-2 overflow-hidden rounded-full bg-white/10">
                  <div
                    className={item.balance >= 0 ? "h-full rounded-full bg-emerald-300" : "h-full rounded-full bg-rose-300"}
                    style={{ width: `${Math.max(item.percentage, 4)}%` }}
                  />
                </div>
                <span className="text-xs app-muted-text">{item.formattedBalance}</span>
              </div>
            ))}
          </div>
        ) : (
          <EmptyChart label={`Sem evolucao suficiente. Pendentes: ${summary.pendingExpense}`} />
        )}
      </article>
    </section>
  );
}
