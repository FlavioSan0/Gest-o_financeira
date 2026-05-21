import { GoalForm } from "@/components/goals/GoalForm";
import { GoalsList } from "@/components/goals/GoalsList";
import { AppShell } from "@/components/layout/AppShell";
import { getGoalsPageData } from "@/services/goals-service";

function SummaryCard({
  label,
  value,
  detail,
}: {
  label: string;
  value: string | number;
  detail: string;
}) {
  return (
    <article className="app-card p-5">
      <p className="text-xs font-bold uppercase tracking-[0.18em] app-faint-text">
        {label}
      </p>
      <strong className="mt-2 block text-2xl font-black text-white">
        {value}
      </strong>
      <span className="mt-1 block text-xs app-muted-text">{detail}</span>
    </article>
  );
}

export default async function GoalsPage() {
  const data = await getGoalsPageData();

  return (
    <AppShell>
      <div className="app-container">
        <div className="desktop-only">
          <div className="grid gap-6">
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
              <div>
                <p className="text-sm font-medium app-faint-text">
                  Planejamento familiar
                </p>

                <h2 className="mt-1 text-3xl font-black tracking-[-0.04em] text-white">
                  Metas
                </h2>

                <p className="mt-2 text-sm app-muted-text">
                  Acompanhe objetivos, valores guardados, progresso e prazos.
                </p>
              </div>
            </div>

            <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <SummaryCard
                label="Ativas"
                value={data.summary.active}
                detail={`${data.summary.total} metas no total`}
              />
              <SummaryCard
                label="Guardado"
                value={data.summary.totalCurrentAmount}
                detail="Somente metas ativas"
              />
              <SummaryCard
                label="Alvo"
                value={data.summary.totalTargetAmount}
                detail="Objetivo ativo"
              />
              <SummaryCard
                label="Media"
                value={`${data.summary.averageProgress}%`}
                detail={`${data.summary.completed} concluidas`}
              />
            </section>

            <div className="grid gap-6 xl:grid-cols-[0.68fr_1.32fr]">
              <GoalForm />
              <GoalsList goals={data.goals} />
            </div>
          </div>
        </div>

        <div className="mobile-only">
          <div className="grid gap-4 pb-24">
            <header className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
              <p className="text-xs font-bold uppercase tracking-[0.18em] app-faint-text">
                Planejamento
              </p>
              <h2 className="mt-2 text-2xl font-black tracking-[-0.04em] text-white">
                Metas
              </h2>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <p className="text-[0.68rem] font-bold uppercase tracking-[0.16em] app-faint-text">
                    Ativas
                  </p>
                  <strong className="mt-1 block text-xl font-black text-white">
                    {data.summary.active}
                  </strong>
                  <span className="mt-1 block text-xs app-muted-text">
                    {data.summary.total} no total
                  </span>
                </div>

                <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <p className="text-[0.68rem] font-bold uppercase tracking-[0.16em] app-faint-text">
                    Progresso
                  </p>
                  <strong className="mt-1 block text-xl font-black text-white">
                    {data.summary.averageProgress}%
                  </strong>
                  <span className="mt-1 block text-xs app-muted-text">
                    {data.summary.completed} concluidas
                  </span>
                </div>
              </div>
            </header>

            <section className="app-card p-5">
              <div className="mb-4">
                <p className="text-xs font-bold uppercase tracking-[0.18em] app-faint-text">
                  Nova meta
                </p>
                <h3 className="mt-1 text-lg font-black text-white">
                  Criar objetivo
                </h3>
              </div>

              <GoalForm compact />
            </section>

            <GoalsList goals={data.goals} />
          </div>
        </div>
      </div>
    </AppShell>
  );
}
