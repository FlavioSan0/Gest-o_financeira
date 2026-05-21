import { CalendarDays, CheckCircle2, Pencil, PiggyBank, Target } from "lucide-react";
import {
  updateGoalCurrentAmountAction,
  updateGoalStatusAction,
} from "@/actions/goals-actions";
import { GoalForm } from "@/components/goals/GoalForm";
import {
  getGoalMoneyInputValue,
  getGoalStatusOptions,
  type GoalListItem,
} from "@/services/goals-service";

type GoalsListProps = {
  goals: GoalListItem[];
};

function getStatusTone(status: GoalListItem["status"]) {
  if (status === "COMPLETED") return "border-emerald-400/30 bg-emerald-400/10 text-emerald-100";
  if (status === "PAUSED") return "border-amber-400/30 bg-amber-400/10 text-amber-100";
  if (status === "CANCELED") return "border-rose-400/30 bg-rose-400/10 text-rose-100";

  return "border-cyan-400/30 bg-cyan-400/10 text-cyan-100";
}

function EmptyGoalsState() {
  return (
    <div className="app-card grid place-items-center p-8 text-center">
      <div className="app-icon-box mx-auto h-14 w-14">
        <Target className="h-6 w-6" />
      </div>

      <h3 className="mt-4 text-xl font-black tracking-[-0.03em] text-white">
        Sem metas ainda
      </h3>

      <p className="mt-2 max-w-sm text-sm app-muted-text">
        Crie a primeira meta para acompanhar progresso, prazo e valor guardado.
      </p>
    </div>
  );
}

function GoalCard({ goal }: { goal: GoalListItem }) {
  return (
    <article className="app-card overflow-hidden p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-black ${getStatusTone(
                goal.status,
              )}`}
            >
              {goal.statusLabel}
            </span>

            {goal.isOverdue ? (
              <span className="inline-flex items-center rounded-full border border-rose-400/30 bg-rose-400/10 px-3 py-1 text-xs font-black text-rose-100">
                Prazo vencido
              </span>
            ) : null}
          </div>

          <h3 className="mt-3 truncate text-xl font-black tracking-[-0.03em] text-white">
            {goal.name}
          </h3>

          <div className="mt-3 flex flex-wrap gap-3 text-xs app-muted-text">
            <span className="inline-flex items-center gap-1.5">
              <PiggyBank className="h-3.5 w-3.5" />
              {goal.currentAmount} de {goal.targetAmount}
            </span>

            <span className="inline-flex items-center gap-1.5">
              <CalendarDays className="h-3.5 w-3.5" />
              {goal.deadline ?? "Sem prazo"}
            </span>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-left lg:text-right">
          <p className="text-xs font-bold uppercase tracking-[0.18em] app-faint-text">
            Progresso
          </p>
          <strong className="mt-1 block text-2xl font-black text-white">
            {goal.progress}%
          </strong>
        </div>
      </div>

      <div className="mt-5">
        <div className="h-3 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-gradient-to-r from-cyan-300 via-emerald-300 to-lime-300"
            style={{ width: `${goal.progress}%` }}
          />
        </div>

        <div className="mt-3 flex flex-wrap justify-between gap-2 text-xs app-muted-text">
          <span>Falta {goal.remainingAmount}</span>
          <span>{goal.currentAmount} guardado</span>
        </div>
      </div>

      <div className="mt-5 grid gap-3 lg:grid-cols-[1fr_1fr_auto]">
        <form action={updateGoalCurrentAmountAction} className="grid gap-2">
          <input type="hidden" name="goalId" value={goal.id} />
          <label className="text-xs font-bold uppercase tracking-[0.16em] app-faint-text">
            Valor atual
          </label>
          <div className="flex gap-2">
            <input
              required
              name="currentAmount"
              inputMode="decimal"
              defaultValue={getGoalMoneyInputValue(goal.rawCurrentAmount)}
              className="finance-input"
            />
            <button type="submit" className="app-button-secondary px-4">
              Atualizar
            </button>
          </div>
        </form>

        <form action={updateGoalStatusAction} className="grid gap-2">
          <input type="hidden" name="goalId" value={goal.id} />
          <label className="text-xs font-bold uppercase tracking-[0.16em] app-faint-text">
            Status
          </label>
          <div className="flex gap-2">
            <select
              name="status"
              defaultValue={goal.status}
              className="finance-input"
            >
              {getGoalStatusOptions().map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <button type="submit" className="app-button-secondary px-4">
              Alterar
            </button>
          </div>
        </form>

        <details className="rounded-2xl border border-white/10 bg-white/[0.03] p-3 lg:min-w-56">
          <summary className="flex cursor-pointer list-none items-center gap-2 text-sm font-black text-white">
            <Pencil className="h-4 w-4" />
            Editar
          </summary>

          <div className="mt-4">
            <GoalForm goal={goal} mode="edit" compact />
          </div>
        </details>
      </div>
    </article>
  );
}

export function GoalsList({ goals }: GoalsListProps) {
  if (goals.length === 0) {
    return <EmptyGoalsState />;
  }

  return (
    <section className="grid gap-4">
      {goals.map((goal) => (
        <GoalCard key={goal.id} goal={goal} />
      ))}

      <div className="hidden items-center gap-2 text-xs app-faint-text md:flex">
        <CheckCircle2 className="h-4 w-4 text-emerald-200" />
        Metas usam apenas dados da familia autenticada.
      </div>
    </section>
  );
}
