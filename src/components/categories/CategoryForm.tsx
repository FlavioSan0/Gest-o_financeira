"use client";

import { useState } from "react";
import { Plus, Tags } from "lucide-react";
import { createCategoryAction } from "@/actions/categories-actions";

type CategoryFormProps = {
  familyId: string;
};

const colorOptions = [
  {
    label: "Verde",
    value: "#22C55E",
    type: "income",
  },
  {
    label: "Vermelho",
    value: "#EF4444",
    type: "expense",
  },
  {
    label: "Azul",
    value: "#38BDF8",
    type: "goal",
  },
  {
    label: "Roxo",
    value: "#A855F7",
    type: "card",
  },
  {
    label: "Âmbar",
    value: "#F59E0B",
    type: "pending",
  },
  {
    label: "Cinza",
    value: "#94A3B8",
    type: "neutral",
  },
];

export function CategoryForm({ familyId }: CategoryFormProps) {
  const [categoryType, setCategoryType] = useState<"INCOME" | "EXPENSE">(
    "EXPENSE",
  );

  const defaultColor = categoryType === "INCOME" ? "#22C55E" : "#EF4444";

  return (
    <form action={createCategoryAction} className="app-card p-6">
      <input type="hidden" name="familyId" value={familyId} />
      <input type="hidden" name="type" value={categoryType} />

      <div className="flex items-start gap-4">
        <div className="app-icon-box h-12 w-12">
          <Tags className="h-5 w-5" />
        </div>

        <div>
          <h3 className="text-xl font-black tracking-[-0.03em] text-white">
            Nova categoria
          </h3>

          <p className="mt-1 text-sm app-faint-text">
            Crie categorias próprias para organizar melhor suas entradas e
            saídas.
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-5">
        <div>
          <label className="mb-3 block text-sm font-bold text-white">
            Tipo da categoria
          </label>

          <div className="grid gap-3 md:grid-cols-2">
            <button
              type="button"
              onClick={() => setCategoryType("EXPENSE")}
              className={
                categoryType === "EXPENSE"
                  ? "rounded-3xl border border-red-500/30 bg-red-500/10 p-5 text-left"
                  : "rounded-3xl border border-white/10 bg-black/25 p-5 text-left transition hover:border-red-500/20 hover:bg-red-500/5"
              }
            >
              <span className="block text-sm font-black finance-expense">
                Saída
              </span>

              <span className="mt-1 block text-xs app-faint-text">
                Para gastos, contas, compras e pagamentos.
              </span>
            </button>

            <button
              type="button"
              onClick={() => setCategoryType("INCOME")}
              className={
                categoryType === "INCOME"
                  ? "rounded-3xl border border-emerald-500/30 bg-emerald-500/10 p-5 text-left"
                  : "rounded-3xl border border-white/10 bg-black/25 p-5 text-left transition hover:border-emerald-500/20 hover:bg-emerald-500/5"
              }
            >
              <span className="block text-sm font-black finance-income">
                Entrada
              </span>

              <span className="mt-1 block text-xs app-faint-text">
                Para salário, renda extra, recebimentos e ganhos.
              </span>
            </button>
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-bold text-white">
            Nome da categoria
          </label>

          <input
            required
            name="name"
            placeholder={
              categoryType === "INCOME"
                ? "Ex: Salário, Freelance, Reembolso..."
                : "Ex: Mercado, Combustível, Internet..."
            }
            className="finance-input"
          />
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-bold text-white">
              Cor
            </label>

            <select
              name="color"
              defaultValue={defaultColor}
              key={categoryType}
              className="finance-input"
            >
              {colorOptions.map((color) => (
                <option key={color.value} value={color.value}>
                  {color.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-bold text-white">
              Ícone
            </label>

            <input
              name="icon"
              placeholder="Ex: home, car, wallet..."
              className="finance-input"
            />
          </div>
        </div>

        <button type="submit" className="app-button-primary w-full">
          <Plus className="h-4 w-4" />
          Criar categoria
        </button>
      </div>
    </form>
  );
}