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

type CategoriesListMobileProps = {
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
    ? "mobile-category-card__type mobile-category-card__type--income"
    : "mobile-category-card__type mobile-category-card__type--expense";
}

export function CategoriesListMobile({
  categories,
  summary,
}: CategoriesListMobileProps) {
  const hasCategories = categories.length > 0;
  const incomeCategories = categories.filter(
    (category) => category.type === "INCOME",
  );
  const expenseCategories = categories.filter(
    (category) => category.type === "EXPENSE",
  );

  return (
    <div className="mobile-categories">
      <section className="mobile-categories-summary">
        <div className="mobile-categories-summary__top">
          <div>
            <span>Total de categorias</span>
            <strong>{summary.total}</strong>
          </div>

          <div className="mobile-categories-summary__icon">
            <Tags className="h-5 w-5" />
          </div>
        </div>

        <div className="mobile-categories-summary__grid">
          <div>
            <span>Entradas</span>
            <b className="finance-income">{summary.income}</b>
          </div>

          <div>
            <span>Saídas</span>
            <b className="finance-expense">{summary.expense}</b>
          </div>
        </div>
      </section>

      <section className="mobile-categories-stats">
        <article>
          <div>
            <Layers3 className="h-4 w-4" />
          </div>
          <span>Ativas</span>
          <strong>{summary.active}</strong>
        </article>

        <article>
          <div>
            <CircleDot className="h-4 w-4" />
          </div>
          <span>Inativas</span>
          <strong className="finance-pending">{summary.inactive}</strong>
        </article>
      </section>

      {!hasCategories && (
        <section className="mobile-section">
          <div className="mobile-empty-state">
            <strong>Nenhuma categoria cadastrada</strong>
            <p>Crie categorias para organizar melhor seus lançamentos.</p>
          </div>
        </section>
      )}

      {hasCategories && (
        <>
          <section className="mobile-section">
            <div className="mobile-section__header">
              <div>
                <p className="mobile-eyebrow">Receitas</p>
                <h3>Entradas</h3>
              </div>

              <span className="mobile-categories-counter">
                {incomeCategories.length}
              </span>
            </div>

            <div className="mobile-categories-list">
              {incomeCategories.map((category) => (
                <article
                  key={category.id}
                  className={
                    category.active
                      ? "mobile-category-card"
                      : "mobile-category-card mobile-category-card--inactive"
                  }
                >
                  <div className="mobile-category-card__top">
                    <div
                      className="mobile-category-card__icon"
                      style={{
                        backgroundColor: category.color
                          ? `${category.color}1A`
                          : "rgba(255,255,255,0.06)",
                        color: category.color || "#FFFFFF",
                      }}
                    >
                      <ArrowUpCircle className="h-5 w-5" />
                    </div>

                    <div className="mobile-category-card__title">
                      <strong>{category.name}</strong>
                      <span>Ícone: {category.icon || "Não definido"}</span>
                    </div>

                    <span className={getTypeClassName(category.type)}>
                      {getTypeLabel(category.type)}
                    </span>
                  </div>

                  {!category.active && (
                    <span className="mobile-category-card__status">
                      Inativa
                    </span>
                  )}

                  <div className="mobile-category-card__action">
                    <ToggleCategoryButton
                      categoryId={category.id}
                      categoryName={category.name}
                      active={category.active}
                    />
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="mobile-section">
            <div className="mobile-section__header">
              <div>
                <p className="mobile-eyebrow">Despesas</p>
                <h3>Saídas</h3>
              </div>

              <span className="mobile-categories-counter">
                {expenseCategories.length}
              </span>
            </div>

            <div className="mobile-categories-list">
              {expenseCategories.map((category) => (
                <article
                  key={category.id}
                  className={
                    category.active
                      ? "mobile-category-card"
                      : "mobile-category-card mobile-category-card--inactive"
                  }
                >
                  <div className="mobile-category-card__top">
                    <div
                      className="mobile-category-card__icon"
                      style={{
                        backgroundColor: category.color
                          ? `${category.color}1A`
                          : "rgba(255,255,255,0.06)",
                        color: category.color || "#FFFFFF",
                      }}
                    >
                      <ArrowDownCircle className="h-5 w-5" />
                    </div>

                    <div className="mobile-category-card__title">
                      <strong>{category.name}</strong>
                      <span>Ícone: {category.icon || "Não definido"}</span>
                    </div>

                    <span className={getTypeClassName(category.type)}>
                      {getTypeLabel(category.type)}
                    </span>
                  </div>

                  {!category.active && (
                    <span className="mobile-category-card__status">
                      Inativa
                    </span>
                  )}

                  <div className="mobile-category-card__action">
                    <ToggleCategoryButton
                      categoryId={category.id}
                      categoryName={category.name}
                      active={category.active}
                    />
                  </div>
                </article>
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
}