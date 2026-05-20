import { CalendarDays, ShieldCheck, TrendingUp } from "lucide-react";

type DashboardHeroProps = {
  monthLabel: string;
  balance: string;
};

export function DashboardHero({ monthLabel, balance }: DashboardHeroProps) {
  return (
    <div className="dashboard-hero-grid">
      <article className="app-card overflow-hidden p-6">
        <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end">
          <div>
            <h2 className="dashboard-hero-title mt-5">
              Visão geral do mês
            </h2>

            <p className="dashboard-hero-description">
              Resumo objetivo com valores PAID e filtros rápidos.
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-black/35 p-5">
            <p className="text-sm app-faint-text">Mês atual</p>

            <div className="mt-3 flex items-center gap-3">
              <CalendarDays className="h-5 w-5 text-white" />
              <strong className="text-xl">{monthLabel}</strong>
            </div>
          </div>
        </div>
      </article>

      <aside className="app-card-light p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-black/55">
              Saldo previsto
            </p>

            <strong className="mt-2 block text-4xl font-black tracking-[-0.04em]">
              {balance}
            </strong>
          </div>

          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-black text-white">
            <TrendingUp className="h-6 w-6" />
          </div>
        </div>

        <div className="mt-8 h-2 overflow-hidden rounded-full bg-black/10">
          <div className="h-full w-[0%] rounded-full bg-black" />
        </div>

        <p className="mt-4 text-sm leading-6 text-black/55">
          O saldo previsto é calculado com base nas entradas e saídas do mês.
        </p>
      </aside>
    </div>
  );
}