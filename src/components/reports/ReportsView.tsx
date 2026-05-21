import { ReportsCharts } from "@/components/reports/ReportsCharts";
import { ReportsFilters } from "@/components/reports/ReportsFilters";
import { ReportsSummary } from "@/components/reports/ReportsSummary";
import { ReportsTransactionsList } from "@/components/reports/ReportsTransactionsList";
import type { ReportsData } from "@/services/reports-service";

type ReportsViewProps = {
  data: ReportsData;
};

export function ReportsView({ data }: ReportsViewProps) {
  return (
    <>
      <div className="desktop-only">
        <div className="app-container grid gap-6">
          <header className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <p className="text-sm font-medium app-faint-text">
                Analise financeira
              </p>
              <h2 className="mt-1 text-3xl font-black tracking-[-0.04em] text-white">
                Relatorios
              </h2>
              <p className="mt-2 text-sm app-muted-text">
                {data.periodLabel}
              </p>
            </div>
          </header>

          <ReportsFilters filters={data.filters} options={data.options} />
          <ReportsSummary summary={data.summary} />
          <ReportsCharts charts={data.charts} summary={data.summary} />
          <ReportsTransactionsList transactions={data.recentTransactions} />
        </div>
      </div>

      <div className="mobile-only">
        <div className="app-container grid gap-4 pb-24">
          <header className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
            <p className="text-xs font-bold uppercase tracking-[0.18em] app-faint-text">
              Analise
            </p>
            <h2 className="mt-2 text-2xl font-black tracking-[-0.04em] text-white">
              Relatorios
            </h2>
            <p className="mt-1 text-sm app-muted-text">{data.periodLabel}</p>
          </header>

          <ReportsFilters filters={data.filters} options={data.options} />
          <ReportsSummary summary={data.summary} />
          <ReportsCharts charts={data.charts} summary={data.summary} />
          <ReportsTransactionsList transactions={data.recentTransactions} />
        </div>
      </div>
    </>
  );
}
