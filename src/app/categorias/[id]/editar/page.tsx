import { notFound } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { CategoryEditForm } from "@/components/categories/CategoryEditForm";
import { getCategoryForEdit } from "@/services/categories-service";

type EditCategoryPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditCategoryPage({
  params,
}: EditCategoryPageProps) {
  const { id } = await params;

  const category = await getCategoryForEdit(id);

  if (!category) {
    notFound();
  }

  return (
    <AppShell>
      <div className="app-container">
        <CategoryEditForm category={category} />
      </div>
    </AppShell>
  );
}