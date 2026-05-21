import { Plus, Target } from "lucide-react";
import { createGoalAction, updateGoalAction } from "@/actions/goals-actions";
import {
  getGoalMoneyInputValue,
  getGoalStatusOptions,
  type GoalListItem,
} from "@/services/goals-service";

type GoalFormProps = {
  goal?: GoalListItem;
  mode?: "create" | "edit";
  compact?: boolean;
};

export function GoalForm({ goal, mode = "create", compact = false }: GoalFormProps) {
  const isEdit = mode === "edit" && goal !== undefined;
  const action = isEdit ? updateGoalAction : createGoalAction;

  return (
    <form action={action} className={compact ? "grid gap-3" : "app-card p-6"}>
      {isEdit && goal ? (
        <input type="hidden" name="goalId" value={goal.id} />
      ) : null}

      {!compact ? (
        <div className="flex items-start gap-4">
          <div className="app-icon-box h-12 w-12">
            <Target className="h-5 w-5" />
          </div>

          <div>
            <h3 className="text-xl font-black tracking-[-0.03em] text-white">
              Nova meta
            </h3>

            <p className="mt-1 text-sm app-faint-text">
              Defina um objetivo financeiro da familia e acompanhe o progresso.
            </p>
          </div>
        </div>
      ) : null}

      <div className={compact ? "grid gap-3" : "mt-6 grid gap-5"}>
        <div>
          <label className="mb-2 block text-sm font-bold text-white">
            Nome
          </label>
          <input
            required
            name="name"
            defaultValue={goal?.name}
            placeholder="Ex: Reserva, viagem, entrada..."
            className="finance-input"
          />
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-bold text-white">
              Alvo
            </label>
            <input
              required
              name="targetAmount"
              inputMode="decimal"
              defaultValue={
                goal ? getGoalMoneyInputValue(goal.rawTargetAmount) : undefined
              }
              placeholder="Ex: 5000,00"
              className="finance-input"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-bold text-white">
              Atual
            </label>
            <input
              name="currentAmount"
              inputMode="decimal"
              defaultValue={
                goal ? getGoalMoneyInputValue(goal.rawCurrentAmount) : undefined
              }
              placeholder="Ex: 1200,00"
              className="finance-input"
              required={Boolean(isEdit)}
            />
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-bold text-white">
              Prazo
            </label>
            <input
              name="deadline"
              type="date"
              defaultValue={goal?.rawDeadline}
              className="finance-input"
            />
          </div>

          {isEdit && goal ? (
            <div>
              <label className="mb-2 block text-sm font-bold text-white">
                Status
              </label>
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
            </div>
          ) : null}
        </div>

        <button type="submit" className="app-button-primary w-full">
          {isEdit ? null : <Plus className="h-4 w-4" />}
          {isEdit ? "Salvar" : "Criar meta"}
        </button>
      </div>
    </form>
  );
}
