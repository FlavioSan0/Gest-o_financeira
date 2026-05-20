"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Save, Tags } from "lucide-react";
import { updateCategoryAction } from "@/actions/categories-actions";

type CategoryEditData = {
  id: string;
  name: string;
  type: "INCOME" | "EXPENSE";
  color: string;
  icon: string;
};

type CategoryEditFormProps = {
  category: CategoryEditData;
};

const colorOptions = [
  {
    label: "Verde",
    value: "#22C55E",
  },
  {
    label: "Vermelho",
    value: "#EF4444",
  },
  {
    label: "Azul",
    value: "#38BDF8",
  },
  {
    label: "Roxo",
    value: "#A855F7",
  },
  {
    label: "Âmbar",
    value: "#F59E0B",
  },
  {
    label: "Cinza",
    value: "#94A3B8",
  },
];

export function CategoryEditForm({ category }: CategoryEditFormProps) {
  const [categoryType, setCategoryType] = useState<"INCOME" | "EXPENSE">(
    category.type,
  );

  return (
    <form action={updateCategoryAction} className="grid gap-6">
      <input type="hidden" name="categoryId" value={category.id} />
      <input type="hidden" name="type" value={categoryType} />

      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <Link
            href="/categorias"
            className="inline-flex items-center gap-2 text-sm font-bold app-faint-text transition hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar para categorias
          </Link>

          <h2 className="mt-3 text-3xl font-black tracking-[-0.04em] text-white">
            Editar categoria
          </h2>

          <p className="mt-2 text-sm app-muted-text">
            Ajuste nome, tipo, cor e ícone da categoria.
          </p>
        </div>

        <button type="submit" className="app-button-primary">
          <Save className="h-4 w-4" />
          Salvar alterações
        </button>
      </div>

      <section className="app-card category-form p-6">
        <div className="category-form__header">
          <div className="app-icon-box h-12 w-12">
            <Tags className="h-5 w-5" />
          </div>

          <div>
            <h3 className="text-xl font-black tracking-[-0.03em] text-white">
              Dados da categoria
            </h3>

            <p className="mt-1 text-sm app-faint-text">
              Essa alteração afeta a organização dos lançamentos vinculados.
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
              defaultValue={category.name}
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
                defaultValue={category.color || "#94A3B8"}
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
                defaultValue={category.icon}
                placeholder="Ex: home, car, wallet..."
                className="finance-input"
              />
            </div>
          </div>
        </div>
      </section>
    </form>
  );
}