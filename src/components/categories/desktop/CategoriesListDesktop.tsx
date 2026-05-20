import {
  ArrowDownCircle,
  ArrowUpCircle,
  CircleDot,
  Layers3,
  Tags,
} from "lucide-react";
import { ToggleCategoryButton } from "@/components/categories/ToggleCategoryButton";

type CategoryItem = {
  id: string;
  name: string;
  type: "INCOME" | "EXPENSE";
  color: string;
  icon: string;
  active: boolean;
};

type CategoriesListDesktopProps = {
  categories: CategoryItem[];
  summary: {
    total: number;
    income: number;
    expense: number;
    active: number;
    inactive: number;
  };
};

function getTypeLabel(type: CategoryItem["type"]) {
  return type === "INCOME" ? "Entrada" : "Saída";
}

function getTypeClassName(type: CategoryItem["type"]) {
  return type === "INCOME"
    ? "finance-badge finance-badge-income"
    : "finance-badge finance-badge-expense";
}

export function CategoriesListDesktop({
  categories,
  summary,
}: CategoriesListDesktopProps) {
  const hasCategories = categories.length > 0;

  return (
    <div className="grid gap-6">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <article className="app-card p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-bold app-faint-text">Total</p>
              <strong className="mt-2 block text-2xl font-black text-white">
                {summary.total}
              </strong>
            </div>

            <div className="app-icon-box h-11 w-11">
              <Tags className="h-5 w-5" />
            </div>
          </div>
        </article>

        <article className="app-card p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-bold app-faint-text">Entradas</p>
              <strong className="mt-2 block text-2xl font-black finance-income">
                {summary.income}
              </strong>
            </div>

            <div className="app-icon-box h-11 w-11">
              <ArrowUpCircle className="h-5 w-5" />
            </div>
          </div>
        </article>

        <article className="app-card p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-bold app-faint-text">Saídas</p>
              <strong className="mt-2 block text-2xl font-black finance-expense">
                {summary.expense}
              </strong>
            </div>

            <div className="app-icon-box h-11 w-11">
              <ArrowDownCircle className="h-5 w-5" />
            </div>
          </div>
        </article>

        <article className="app-card p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-bold app-faint-text">Ativas</p>
              <strong className="mt-2 block text-2xl font-black text-white">
                {summary.active}
              </strong>
            </div>

            <div className="app-icon-box h-11 w-11">
              <Layers3 className="h-5 w-5" />
            </div>
          </div>
        </article>
      </section>

      <section className="app-card p-6">
        <div className="flex flex-col justify-between gap-4 border-b border-white/10 pb-5 md:flex-row md:items-center">
          <div>
            <h3 className="text-xl font-black tracking-[-0.03em] text-white">
              Categorias cadastradas
            </h3>

            <p className="mt-1 text-sm app-faint-text">
              Organize entradas e saídas com categorias personalizadas.
            </p>
          </div>

          <span className="finance-badge border border-white/10 bg-white/5 text-white/70">
            {summary.inactive} inativas
          </span>
        </div>

        {!hasCategories && (
          <div className="mt-6 flex min-h-65 flex-col items-center justify-center rounded-[1.75rem] border border-dashed border-white/15 bg-black/25 p-8 text-center">
            <div className="app-icon-box h-16 w-16 rounded-3xl">
              <Tags className="h-8 w-8" />
            </div>

            <h3 className="mt-5 text-lg font-bold text-white">
              Nenhuma categoria cadastrada
            </h3>

            <p className="mt-2 max-w-md text-sm leading-6 app-faint-text">
              Crie categorias para organizar melhor seus lançamentos.
            </p>
          </div>
        )}

        {hasCategories && (
          <div className="mt-5 grid gap-3">
            {categories.map((category) => (
              <article
                key={category.id}
                className={
                  category.active
                    ? "rounded-3xl border border-white/10 bg-black/25 p-4 transition hover:border-white/20 hover:bg-white/4"
                    : "rounded-3xl border border-white/5 bg-black/15 p-4 opacity-55"
                }
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex min-w-0 items-center gap-4">
                    <div
                      className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/10"
                      style={{
                        backgroundColor: category.color
                          ? `${category.color}1A`
                          : "rgba(255,255,255,0.06)",
                        color: category.color || "#FFFFFF",
                      }}
                    >
                      <CircleDot className="h-5 w-5" />
                    </div>

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <strong className="text-base font-black text-white">
                          {category.name}
                        </strong>

                        <span className={getTypeClassName(category.type)}>
                          {getTypeLabel(category.type)}
                        </span>

                        {!category.active && (
                          <span className="finance-badge finance-badge-neutral">
                            Inativa
                          </span>
                        )}
                      </div>

                      <p className="mt-2 text-xs app-faint-text">
                        Ícone: {category.icon || "Não definido"}
                      </p>
                    </div>
                  </div>

                  <ToggleCategoryButton
                    categoryId={category.id}
                    categoryName={category.name}
                    active={category.active}
                  />
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}