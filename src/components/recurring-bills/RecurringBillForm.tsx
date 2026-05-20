import { CalendarDays, Plus, Repeat } from "lucide-react";
import { createRecurringBillAction } from "@/actions/recurring-bills-actions";

type CategoryOption = {
  id: string;
  name: string;
};

type RecurringBillFormProps = {
  familyId: string;
  categories: CategoryOption[];
};

export function RecurringBillForm({
  familyId,
  categories,
}: RecurringBillFormProps) {
  return (
    <form action={createRecurringBillAction} className="app-card p-6">
      <input type="hidden" name="familyId" value={familyId} />

      <div className="flex items-start gap-4">
        <div className="app-icon-box h-12 w-12">
          <Repeat className="h-5 w-5" />
        </div>

        <div>
          <h3 className="text-xl font-black tracking-[-0.03em] text-white">
            Nova conta fixa
          </h3>

          <p className="mt-1 text-sm app-faint-text">
            Cadastre despesas mensais para acompanhar vencimentos e gerar
            lançamentos.
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-5">
        <div>
          <label className="mb-2 block text-sm font-bold text-white">
            Descrição
          </label>

          <input
            required
            name="description"
            placeholder="Ex: Aluguel, internet, energia..."
            className="finance-input"
          />
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-bold text-white">
              Valor previsto
            </label>

            <input
              required
              name="amount"
              inputMode="decimal"
              placeholder="Ex: 150,00"
              className="finance-input"
            />
          </div>

          <div>
            <label className="mb-2 flex items-center gap-2 text-sm font-bold text-white">
              <CalendarDays className="h-4 w-4" />
              Dia de vencimento
            </label>

            <input
              required
              name="dueDay"
              type="number"
              min={1}
              max={31}
              placeholder="Ex: 10"
              className="finance-input"
            />
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-bold text-white">
            Categoria
          </label>

          <select name="categoryId" className="finance-input" defaultValue="">
            <option value="">Sem categoria</option>

            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <button type="submit" className="app-button-primary w-full">
          <Plus className="h-4 w-4" />
          Cadastrar conta fixa
        </button>
      </div>
    </form>
  );
}