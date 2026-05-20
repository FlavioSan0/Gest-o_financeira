import { CategoriesListDesktop } from "@/components/categories/desktop/CategoriesListDesktop";
import { CategoriesListMobile } from "@/components/categories/mobile/CategoriesListMobile";

type CategoryItem = {
  id: string;
  name: string;
  type: "INCOME" | "EXPENSE";
  color: string;
  icon: string;
  active: boolean;
};

type CategoriesListProps = {
  familyId: string;
  categories: CategoryItem[];
  summary: {
    total: number;
    income: number;
    expense: number;
    active: number;
    inactive: number;
  };
};

export function CategoriesList(props: CategoriesListProps) {
  return (
    <>
      <div className="desktop-only">
        <CategoriesListDesktop
          categories={props.categories}
          summary={props.summary}
        />
      </div>

      <div className="mobile-only">
        <CategoriesListMobile
          familyId={props.familyId}
          categories={props.categories}
          summary={props.summary}
        />
      </div>
    </>
  );
}