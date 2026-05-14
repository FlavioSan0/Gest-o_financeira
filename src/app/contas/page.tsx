import { AppShell } from "@/components/layout/AppShell";
import { AccountForm } from "@/components/accounts/AccountForm";
import { AccountsList } from "@/components/accounts/AccountsList";
import { getAccountsPageData } from "@/services/accounts-service";

export default async function AccountsPage() {
  const data = await getAccountsPageData();

  return (
    <AppShell>
      <div className="app-container grid gap-6">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <p className="text-sm font-medium app-faint-text">
              Estrutura financeira
            </p>

            <h2 className="mt-1 text-3xl font-black tracking-[-0.04em] text-white">
              Contas
            </h2>

            <p className="mt-2 text-sm app-muted-text">
              Cadastre e gerencie bancos, carteiras e locais de movimentação.
            </p>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[0.72fr_1.28fr]">
          <AccountForm familyId={data.familyId} />

          <AccountsList accounts={data.accounts} summary={data.summary} />
        </div>
      </div>
    </AppShell>
  );
}