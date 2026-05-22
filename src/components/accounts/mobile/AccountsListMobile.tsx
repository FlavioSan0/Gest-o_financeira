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

type AccountsListMobileProps = {
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

export function AccountsListMobile({
  accounts,
  summary,
}: AccountsListMobileProps) {
  const hasAccounts = accounts.length > 0;

  return (
    <div className="mobile-accounts">
      <section className="mobile-accounts-balance">
        <div className="mobile-accounts-balance__top">
          <div>
            <span>Saldo atual</span>
            <strong>{summary.totalCurrentBalance}</strong>
          </div>

          <div className="mobile-accounts-balance__icon">
            <Wallet className="h-5 w-5" />
          </div>
        </div>

        <div className="mobile-accounts-balance__grid">
          <div>
            <span>Saldo inicial</span>
            <b>{summary.totalInitialBalance}</b>
          </div>

          <div>
            <span>Contas</span>
            <b>{summary.total}</b>
          </div>
        </div>
      </section>

      <section className="mobile-accounts-stats">
        <article>
          <div>
            <WalletCards className="h-4 w-4" />
          </div>
          <span>Ativas</span>
          <strong className="finance-income">{summary.active}</strong>
        </article>

        <article>
          <div>
            <PiggyBank className="h-4 w-4" />
          </div>
          <span>Inativas</span>
          <strong className="finance-pending">{summary.inactive}</strong>
        </article>
      </section>

      <section className="mobile-section">
        <div className="mobile-section__header">
          <div>
            <p className="mobile-eyebrow">Minhas contas</p>
            <h3>Contas cadastradas</h3>
          </div>

          <span className="mobile-accounts-counter">{summary.total}</span>
        </div>

        {!hasAccounts && (
          <div className="mobile-empty-state">
            <strong>Nenhuma conta cadastrada</strong>
            <p>Cadastre contas para organizar onde o dinheiro entra ou sai.</p>
          </div>
        )}

        {hasAccounts && (
          <div className="mobile-accounts-list">
            {accounts.map((account) => {
              const Icon = getAccountIcon(account.type);

              return (
                <article
                  key={account.id}
                  className={
                    account.active
                      ? "mobile-account-card"
                      : "mobile-account-card mobile-account-card--inactive"
                  }
                >
                  <div className="mobile-account-card__top">
                    <div className="mobile-account-card__icon">
                      <Icon className="h-5 w-5" />
                    </div>

                    <div className="mobile-account-card__title">
                      <strong>{account.name}</strong>
                      <span>{getAccountTypeLabel(account.type)}</span>
                    </div>

                    <span
                      className={
                        account.active
                          ? "mobile-account-card__status active"
                          : "mobile-account-card__status"
                      }
                    >
                      {account.active ? "Ativa" : "Inativa"}
                    </span>
                  </div>

                  <div className="mobile-account-card__balance">
                    <span>Saldo atual</span>
                    <strong>{account.currentBalance}</strong>
                  </div>

                  <div className="mobile-account-card__meta">
                    <span>Saldo inicial</span>
                    <strong>{account.initialBalance}</strong>
                  </div>

                  <div className="mobile-account-card__action">
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
