import { AppShell } from "@/components/layout/AppShell";
import { CategoriesList } from "@/components/categories/CategoriesList";
import { CategoryForm } from "@/components/categories/CategoryForm";
import { getCategoriesPageData } from "@/services/categories-service";

export default async function CategoriesPage() {
  const data = await getCategoriesPageData();

  return (
    <AppShell>
      <div className="app-container grid gap-6">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <p className="text-sm font-medium app-faint-text">
              Organização financeira
            </p>

            <h2 className="mt-1 text-3xl font-black tracking-[-0.04em] text-white">
              Categorias
            </h2>

            <p className="mt-2 text-sm app-muted-text">
              Cadastre e organize categorias para entradas e saídas.
            </p>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[0.72fr_1.28fr]">
          <CategoryForm familyId={data.familyId} />

          <CategoriesList categories={data.categories} summary={data.summary} />
        </div>
      </div>
    </AppShell>
  );
}