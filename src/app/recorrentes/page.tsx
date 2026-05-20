import { AppShell } from "@/components/layout/AppShell";
import { RecurringBillForm } from "@/components/recurring-bills/RecurringBillForm";
import { RecurringBillsList } from "@/components/recurring-bills/RecurringBillsList";
import { getRecurringBillsPageData } from "@/services/recurring-bills-service";

export default async function RecurringBillsPage() {
  const data = await getRecurringBillsPageData();

  return (
    <AppShell>
      <div className="app-container">
        <div className="desktop-only">
          <div className="grid gap-6">
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
              <div>
                <p className="text-sm font-medium app-faint-text">
                  Planejamento financeiro
                </p>

                <h2 className="mt-1 text-3xl font-black tracking-[-0.04em] text-white">
                  Contas fixas
                </h2>

                <p className="mt-2 text-sm app-muted-text">
                  Cadastre despesas recorrentes e gere lançamentos mensais com
                  controle.
                </p>
              </div>
            </div>

            <div className="grid gap-6 xl:grid-cols-[0.72fr_1.28fr]">
              <RecurringBillForm
                familyId={data.familyId}
                categories={data.categories}
              />

              <RecurringBillsList
                recurringBills={data.recurringBills}
                summary={data.summary}
              />
            </div>
          </div>
        </div>

        <div className="mobile-only">
          <div className="mobile-recurring-page">
            <header className="mobile-recurring-hero">
              <div>
                <p className="mobile-eyebrow">Planejamento financeiro</p>

                <h2>Contas fixas</h2>

                <span>
                  {data.summary.active} ativas • {data.summary.inactive}{" "}
                  inativas
                </span>
              </div>
            </header>

            <RecurringBillForm
              familyId={data.familyId}
              categories={data.categories}
            />

            <RecurringBillsList
              recurringBills={data.recurringBills}
              summary={data.summary}
            />
          </div>
        </div>
      </div>
    </AppShell>
  );
}