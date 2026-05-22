import {
  Banknote,
  CircleDollarSign,
  Landmark,
  PiggyBank,
  Wallet,
  WalletCards,
} from "lucide-react";
import { AccountActionsButton } from "@/components/accounts/AccountActionsButton";

type AccountItem = {
  id: string;
  name: string;
  type: "CHECKING" | "SAVINGS" | "CASH" | "WALLET" | "INVESTMENT" | "OTHER";
  initialBalance: string;
  currentBalance: string;
  rawInitialBalance: number;
  rawCurrentBalance: number;
  active: boolean;
};

type AccountsListDesktopProps = {
  accounts: AccountItem[];
  summary: {
    total: number;
    active: number;
    inactive: number;
    totalCurrentBalance: string;
    totalInitialBalance: string;
  };
};

function getAccountTypeLabel(type: AccountItem["type"]) {
  const labels = {
    CHECKING: "Conta corrente",
    SAVINGS: "Poupança",
    CASH: "Dinheiro físico",
    WALLET: "Carteira digital",
    INVESTMENT: "Investimento",
    OTHER: "Outro",
  };

  return labels[type];
}

function getAccountIcon(type: AccountItem["type"]) {
  const icons = {
    CHECKING: Landmark,
    SAVINGS: PiggyBank,
    CASH: Banknote,
    WALLET: Wallet,
    INVESTMENT: CircleDollarSign,
    OTHER: WalletCards,
  };

  return icons[type];
}

export function AccountsListDesktop({
  accounts,
  summary,
}: AccountsListDesktopProps) {
  const hasAccounts = accounts.length > 0;

  return (
    <div className="grid gap-6">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <article className="app-card p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-bold app-faint-text">Saldo atual</p>
              <strong className="mt-2 block text-2xl font-black text-white">
                {summary.totalCurrentBalance}
              </strong>
            </div>

            <div className="app-icon-box h-11 w-11">
              <Wallet className="h-5 w-5" />
            </div>
          </div>
        </article>

        <article className="app-card p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-bold app-faint-text">Saldo inicial</p>
              <strong className="mt-2 block text-2xl font-black text-white">
                {summary.totalInitialBalance}
              </strong>
            </div>

            <div className="app-icon-box h-11 w-11">
              <CircleDollarSign className="h-5 w-5" />
            </div>
          </div>
        </article>

        <article className="app-card p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-bold app-faint-text">Contas ativas</p>
              <strong className="mt-2 block text-2xl font-black finance-income">
                {summary.active}
              </strong>
            </div>

            <div className="app-icon-box h-11 w-11">
              <WalletCards className="h-5 w-5" />
            </div>
          </div>
        </article>

        <article className="app-card p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-bold app-faint-text">Inativas</p>
              <strong className="mt-2 block text-2xl font-black finance-pending">
                {summary.inactive}
              </strong>
            </div>

            <div className="app-icon-box h-11 w-11">
              <PiggyBank className="h-5 w-5" />
            </div>
          </div>
        </article>
      </section>

      <section className="app-card p-6">
        <div className="flex flex-col justify-between gap-4 border-b border-white/10 pb-5 md:flex-row md:items-center">
          <div>
            <h3 className="text-xl font-black tracking-[-0.03em] text-white">
              Contas cadastradas
            </h3>

            <p className="mt-1 text-sm app-faint-text">
              Organize bancos, carteiras e locais onde o dinheiro fica.
            </p>
          </div>

          <span className="finance-badge border border-white/10 bg-white/5 text-white/70">
            {summary.total} contas
          </span>
        </div>

        {!hasAccounts && (
          <div className="mt-6 flex min-h-65 flex-col items-center justify-center rounded-[1.75rem] border border-dashed border-white/15 bg-black/25 p-8 text-center">
            <div className="app-icon-box h-16 w-16 rounded-3xl">
              <WalletCards className="h-8 w-8" />
            </div>

            <h3 className="mt-5 text-lg font-bold text-white">
              Nenhuma conta cadastrada
            </h3>

            <p className="mt-2 max-w-md text-sm leading-6 app-faint-text">
              Cadastre contas para organizar onde cada lançamento entra ou sai.
            </p>
          </div>
        )}

        {hasAccounts && (
          <div className="mt-5 grid gap-3">
            {accounts.map((account) => {
              const Icon = getAccountIcon(account.type);

              return (
                <article
                  key={account.id}
                  className={
                    account.active
                      ? "rounded-3xl border border-white/10 bg-black/25 p-4 transition hover:border-white/20 hover:bg-white/4"
                      : "rounded-3xl border border-white/5 bg-black/15 p-4 opacity-55"
                  }
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex min-w-0 items-center gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-white">
                        <Icon className="h-5 w-5" />
                      </div>

                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <strong className="text-base font-black text-white">
                            {account.name}
                          </strong>

                          <span className="finance-badge border border-white/10 bg-white/5 text-white/70">
                            {getAccountTypeLabel(account.type)}
                          </span>

                          {!account.active && (
                            <span className="finance-badge finance-badge-neutral">
                              Inativa
                            </span>
                          )}
                        </div>

                        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-2 text-xs app-faint-text">
                          <span>Saldo inicial: {account.initialBalance}</span>
                          <span>Saldo atual: {account.currentBalance}</span>
                        </div>
                      </div>
                    </div>

                    <AccountActionsButton account={account} />
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
