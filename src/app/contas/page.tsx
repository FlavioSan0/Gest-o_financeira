import { AppShell } from "@/components/layout/AppShell";
import { AccountForm } from "@/components/accounts/AccountForm";
import { AccountsList } from "@/components/accounts/AccountsList";
import { getAccountsPageData } from "@/services/accounts-service";

export default async function AccountsPage() {
  const data = await getAccountsPageData();

  return (
    <AppShell>
      <div className="app-container">
        <div className="desktop-only">
          <div className="grid gap-6">
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
              <div>
                <p className="text-sm font-medium app-faint-text">
                  Estrutura financeira
                </p>

                <h2 className="mt-1 text-3xl font-black tracking-[-0.04em] text-white">
                  Contas
                </h2>

                <p className="mt-2 text-sm app-muted-text">
                  Cadastre e gerencie bancos, carteiras e locais de
                  movimentação.
                </p>
              </div>
            </div>

            <div className="grid gap-6 xl:grid-cols-[0.72fr_1.28fr]">
              <AccountForm familyId={data.familyId} />

              <AccountsList accounts={data.accounts} summary={data.summary} />
            </div>
          </div>
        </div>

        <div className="mobile-only">
          <div className="mobile-accounts-page">
            <header className="mobile-accounts-hero">
              <div>
                <p className="mobile-eyebrow">Estrutura financeira</p>
                <h2>Contas</h2>
                <span>
                  {data.summary.active} ativas • {data.summary.inactive}{" "}
                  inativas
                </span>
              </div>
            </header>

            <AccountsList accounts={data.accounts} summary={data.summary} />

            <section className="mobile-accounts-form-section">
              <div className="mobile-section__header">
                <div>
                  <p className="mobile-eyebrow">Nova conta</p>
                  <h3>Cadastrar conta</h3>
                </div>
              </div>

              <AccountForm familyId={data.familyId} />
            </section>
          </div>
        </div>
      </div>
    </AppShell>
  );
}