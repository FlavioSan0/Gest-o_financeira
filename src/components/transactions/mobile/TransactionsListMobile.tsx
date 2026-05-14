import Link from "next/link";
import {
  ArrowDownCircle,
  ArrowRight,
  ArrowUpCircle,
  CalendarDays,
  CreditCard,
  Pencil,
  Plus,
  ReceiptText,
  Search,
  UserRound,
  Wallet,
} from "lucide-react";
import { DeleteTransactionButton } from "@/components/transactions/DeleteTransactionButton";

type TransactionItem = {
  id: string;
  description: string;
  amount: string;
  rawAmount: number;
  type: "INCOME" | "EXPENSE";
  status: "PAID" | "PENDING" | "OVERDUE" | "CANCELED";
  paymentMethod:
    | "PIX"
    | "CASH"
    | "DEBIT_CARD"
    | "CREDIT_CARD"
    | "BANK_TRANSFER"
    | "BOLETO"
    | "OTHER";
  date: string;
  category: string;
  account: string;
  responsible: string;
  notes: string | null;
};

type ResponsibleOption = {
  id: string;
  name: string;
};

type ResponsibleSummaryCard = {
  id: string;
  name: string;
  income: string;
  expense: string;
  balance: string;
  transactionsCount: number;
  isGeneral: boolean;
};

type TransactionsListMobileProps = {
  transactions: TransactionItem[];
  summary: {
    totalIncome: string;
    totalExpense: string;
    balance: string;
    totalTransactions: number;
  };
  responsibleSummaryCards: ResponsibleSummaryCard[];
  filters: {
    search: string;
    type: string;
    status: string;
    paymentMethod: string;
    responsibleId: string;
  };
  responsibleOptions: ResponsibleOption[];
};

function getStatusLabel(status: TransactionItem["status"]) {
  const labels = {
    PAID: "Pago",
    PENDING: "Pendente",
    OVERDUE: "Atrasado",
    CANCELED: "Cancelado",
  };

  return labels[status];
}

function getPaymentMethodLabel(method: TransactionItem["paymentMethod"]) {
  const labels = {
    PIX: "Pix",
    CASH: "Dinheiro",
    DEBIT_CARD: "Débito",
    CREDIT_CARD: "Crédito",
    BANK_TRANSFER: "Transferência",
    BOLETO: "Boleto",
    OTHER: "Outro",
  };

  return labels[method];
}

function getTypeLabel(type: TransactionItem["type"]) {
  return type === "INCOME" ? "Entrada" : "Saída";
}

function getTransactionIcon(type: TransactionItem["type"]) {
  return type === "INCOME" ? ArrowUpCircle : ArrowDownCircle;
}

function buildTransactionsHref(
  filters: TransactionsListMobileProps["filters"],
  overrides: Partial<TransactionsListMobileProps["filters"]>,
) {
  const nextFilters = {
    ...filters,
    ...overrides,
  };

  const params = new URLSearchParams();

  if (nextFilters.search.trim()) {
    params.set("search", nextFilters.search.trim());
  }

  if (nextFilters.type && nextFilters.type !== "ALL") {
    params.set("type", nextFilters.type);
  }

  if (nextFilters.status && nextFilters.status !== "ALL") {
    params.set("status", nextFilters.status);
  }

  if (nextFilters.paymentMethod && nextFilters.paymentMethod !== "ALL") {
    params.set("paymentMethod", nextFilters.paymentMethod);
  }

  if (nextFilters.responsibleId && nextFilters.responsibleId !== "ALL") {
    params.set("responsibleId", nextFilters.responsibleId);
  }

  const query = params.toString();

  return query ? `/lancamentos?${query}` : "/lancamentos";
}

function getActiveResponsibleName(
  responsibleOptions: ResponsibleOption[],
  responsibleId: string,
) {
  if (responsibleId === "ALL") {
    return "Todos";
  }

  return (
    responsibleOptions.find((responsible) => responsible.id === responsibleId)
      ?.name ?? "Responsável"
  );
}

export function TransactionsListMobile({
  transactions,
  summary,
  responsibleSummaryCards,
  filters,
  responsibleOptions,
}: TransactionsListMobileProps) {
  const hasTransactions = transactions.length > 0;
  const generalCard = responsibleSummaryCards.find((card) => card.isGeneral);
  const individualCards = responsibleSummaryCards.filter(
    (card) => !card.isGeneral,
  );

  return (
    <div className="mobile-transactions">
      <header className="mobile-transactions-hero">
        <div>
          <p className="mobile-eyebrow">Controle financeiro</p>
          <h2>Lançamentos</h2>
          <span>{summary.totalTransactions} registros encontrados</span>
        </div>

        <Link href="/lancamentos/novo" className="mobile-transactions-add">
          <Plus className="h-5 w-5" />
        </Link>
      </header>

      <section className="mobile-transactions-balance">
        <div className="mobile-transactions-balance__top">
          <div>
            <span>Saldo filtrado</span>
            <strong>{summary.balance}</strong>
          </div>

          <div className="mobile-transactions-balance__icon">
            <Wallet className="h-5 w-5" />
          </div>
        </div>

        <div className="mobile-transactions-balance__grid">
          <div>
            <span>Entradas</span>
            <b className="finance-income">{summary.totalIncome}</b>
          </div>

          <div>
            <span>Saídas</span>
            <b className="finance-expense">{summary.totalExpense}</b>
          </div>
        </div>
      </section>

      <section className="mobile-transactions-filter-card">
        <form action="/lancamentos" className="mobile-transactions-search">
          <div className="mobile-transactions-search__field">
            <Search className="h-4 w-4" />
            <input
              name="search"
              defaultValue={filters.search}
              placeholder="Buscar lançamento..."
            />
          </div>

          <input type="hidden" name="type" value={filters.type} />
          <input type="hidden" name="status" value={filters.status} />
          <input
            type="hidden"
            name="paymentMethod"
            value={filters.paymentMethod}
          />
          <input
            type="hidden"
            name="responsibleId"
            value={filters.responsibleId}
          />
        </form>

        <div className="mobile-filter-chips">
          <Link
            href={buildTransactionsHref(filters, { type: "ALL" })}
            className={
              filters.type === "ALL"
                ? "mobile-filter-chip mobile-filter-chip--active"
                : "mobile-filter-chip"
            }
          >
            Todos
          </Link>

          <Link
            href={buildTransactionsHref(filters, { type: "INCOME" })}
            className={
              filters.type === "INCOME"
                ? "mobile-filter-chip mobile-filter-chip--income mobile-filter-chip--active"
                : "mobile-filter-chip mobile-filter-chip--income"
            }
          >
            Entradas
          </Link>

          <Link
            href={buildTransactionsHref(filters, { type: "EXPENSE" })}
            className={
              filters.type === "EXPENSE"
                ? "mobile-filter-chip mobile-filter-chip--expense mobile-filter-chip--active"
                : "mobile-filter-chip mobile-filter-chip--expense"
            }
          >
            Saídas
          </Link>
        </div>

        <form action="/lancamentos" className="mobile-filter-selects">
          <input type="hidden" name="search" value={filters.search} />
          <input type="hidden" name="type" value={filters.type} />

          <div>
            <label>Status</label>

            <select
              name="status"
              defaultValue={filters.status}
              className="finance-input"
            >
              <option value="ALL">Todos</option>
              <option value="PAID">Pago</option>
              <option value="PENDING">Pendente</option>
              <option value="OVERDUE">Atrasado</option>
              <option value="CANCELED">Cancelado</option>
            </select>
          </div>

          <div>
            <label>Pagamento</label>

            <select
              name="paymentMethod"
              defaultValue={filters.paymentMethod}
              className="finance-input"
            >
              <option value="ALL">Todos</option>
              <option value="PIX">Pix</option>
              <option value="CASH">Dinheiro</option>
              <option value="DEBIT_CARD">Débito</option>
              <option value="CREDIT_CARD">Crédito</option>
              <option value="BANK_TRANSFER">Transferência</option>
              <option value="BOLETO">Boleto</option>
              <option value="OTHER">Outro</option>
            </select>
          </div>

          <div>
            <label>Responsável</label>

            <select
              name="responsibleId"
              defaultValue={filters.responsibleId}
              className="finance-input"
            >
              <option value="ALL">Todos</option>

              {responsibleOptions.map((responsible) => (
                <option key={responsible.id} value={responsible.id}>
                  {responsible.name}
                </option>
              ))}
            </select>
          </div>

          <button type="submit">Aplicar filtros</button>
        </form>
      </section>

      <section className="mobile-transactions-responsibles">
        <div className="mobile-section__header">
          <div>
            <p className="mobile-eyebrow">Responsáveis</p>
            <h3>Resumo por pessoa</h3>
          </div>

          <span>{getActiveResponsibleName(responsibleOptions, filters.responsibleId)}</span>
        </div>

        <div className="mobile-transactions-responsible-scroll">
          {generalCard && (
            <Link
              href={buildTransactionsHref(filters, { responsibleId: "ALL" })}
              className={
                filters.responsibleId === "ALL"
                  ? "mobile-transactions-responsible active"
                  : "mobile-transactions-responsible"
              }
            >
              <div>
                <UserRound className="h-4 w-4" />
              </div>

              <strong>{generalCard.name}</strong>
              <span>{generalCard.balance}</span>
            </Link>
          )}

          {individualCards.map((card) => (
            <Link
              key={card.id}
              href={buildTransactionsHref(filters, {
                responsibleId: card.id,
              })}
              className={
                filters.responsibleId === card.id
                  ? "mobile-transactions-responsible active"
                  : "mobile-transactions-responsible"
              }
            >
              <div>
                <UserRound className="h-4 w-4" />
              </div>

              <strong>{card.name}</strong>
              <span>{card.balance}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="mobile-section">
        <div className="mobile-section__header">
          <div>
            <p className="mobile-eyebrow">Histórico</p>
            <h3>Movimentações</h3>
          </div>

          <Link href="/lancamentos/novo" className="mobile-see-all">
            Novo
          </Link>
        </div>

        {!hasTransactions && (
          <div className="mobile-empty-state">
            <strong>Nenhum lançamento encontrado</strong>
            <p>Ajuste os filtros ou cadastre uma nova entrada ou saída.</p>
            <Link href="/lancamentos/novo">Criar lançamento</Link>
          </div>
        )}

        {hasTransactions && (
          <div className="mobile-transactions-list">
            {transactions.map((transaction) => {
              const Icon = getTransactionIcon(transaction.type);

              return (
                <article key={transaction.id} className="mobile-transaction-row">
                  <div className="mobile-transaction-row__icon">
                    <Icon className="h-5 w-5" />
                  </div>

                  <div className="mobile-transaction-row__content">
                    <div className="mobile-transaction-row__title">
                      <strong>{transaction.description}</strong>
                      <span>{getStatusLabel(transaction.status)}</span>
                    </div>

                    <div className="mobile-transaction-row__meta">
                      <span>
                        <CalendarDays className="h-3.5 w-3.5" />
                        {transaction.date}
                      </span>

                      <span>{transaction.category}</span>

                      <span>{transaction.responsible}</span>

                      <span>
                        <CreditCard className="h-3.5 w-3.5" />
                        {getPaymentMethodLabel(transaction.paymentMethod)}
                      </span>
                    </div>

                    {transaction.notes && (
                      <p className="mobile-transaction-row__notes">
                        {transaction.notes}
                      </p>
                    )}
                  </div>

                  <div className="mobile-transaction-row__side">
                    <strong
                      className={
                        transaction.type === "INCOME"
                          ? "finance-income"
                          : "finance-expense"
                      }
                    >
                      {transaction.type === "INCOME" ? "+" : "-"}{" "}
                      {transaction.amount}
                    </strong>

                    <span>{getTypeLabel(transaction.type)}</span>

                    <div className="mobile-transaction-row__actions">
                      <Link href={`/lancamentos/${transaction.id}/editar`}>
                        <Pencil className="h-4 w-4" />
                      </Link>

                      <DeleteTransactionButton
                        transactionId={transaction.id}
                        transactionDescription={transaction.description}
                      />
                    </div>
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