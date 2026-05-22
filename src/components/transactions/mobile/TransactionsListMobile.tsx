"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ArrowDownCircle,
  ArrowUpCircle,
  CalendarDays,
  CreditCard,
  Filter,
  Pencil,
  Plus,
  RotateCcw,
  Search,
  SlidersHorizontal,
  UserRound,
  Wallet,
  X,
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
  repeatLabel?: string | null;
};

type ResponsibleOption = {
  id: string;
  name: string;
};

type CategoryOption = {
  id: string;
  name: string;
  type: "INCOME" | "EXPENSE";
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
    categoryId: string;
    month: string;
    year: string;
  };
  responsibleOptions: ResponsibleOption[];
  categoryOptions: CategoryOption[];
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
    DEBIT_CARD: "Debito",
    CREDIT_CARD: "Credito",
    BANK_TRANSFER: "Transferencia",
    BOLETO: "Boleto",
    OTHER: "Outro",
  };

  return labels[method];
}

function getTypeLabel(type: TransactionItem["type"]) {
  return type === "INCOME" ? "Entrada" : "Saida";
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

  if (nextFilters.categoryId && nextFilters.categoryId !== "ALL") {
    params.set("categoryId", nextFilters.categoryId);
  }

  if (nextFilters.month && nextFilters.month !== "ALL") {
    params.set("month", nextFilters.month);
  }

  if (nextFilters.year) {
    params.set("year", nextFilters.year);
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
      ?.name ?? "Responsavel"
  );
}

export function TransactionsListMobile({
  transactions,
  summary,
  responsibleSummaryCards,
  filters,
  responsibleOptions,
  categoryOptions,
}: TransactionsListMobileProps) {
  const [filtersOpen, setFiltersOpen] = useState(false);
  const hasTransactions = transactions.length > 0;
  const currentYear = new Date().getFullYear();
  const yearOptions = [currentYear - 1, currentYear, currentYear + 1];

  if (!yearOptions.map(String).includes(filters.year)) {
    yearOptions.unshift(Number(filters.year));
  }

  const generalCard = responsibleSummaryCards.find((card) => card.isGeneral);
  const individualCards = responsibleSummaryCards.filter(
    (card) => !card.isGeneral,
  );
  const activeFiltersCount = [
    filters.search.trim() !== "",
    filters.type !== "ALL",
    filters.status !== "ALL",
    filters.responsibleId !== "ALL",
    filters.categoryId !== "ALL",
    filters.month === "ALL",
  ].filter(Boolean).length;

  return (
    <div className="mobile-transactions">
      <header className="mobile-transactions-hero">
        <div>
          <p className="mobile-eyebrow">Controle financeiro</p>
          <h2>Lancamentos</h2>
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
            <span>Saidas</span>
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
              placeholder="Buscar lancamento..."
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
          <input type="hidden" name="categoryId" value={filters.categoryId} />
          <input type="hidden" name="month" value={filters.month} />
          <input type="hidden" name="year" value={filters.year} />
        </form>

        <div className="mobile-filter-summary">
          <div>
            <span>
              {filters.month === "ALL" ? "Ano todo" : `${filters.month}/${filters.year}`}
            </span>
            <strong>
              {activeFiltersCount > 0
                ? `${activeFiltersCount} filtro${
                    activeFiltersCount > 1 ? "s" : ""
                  }`
                : "Mes atual"}
            </strong>
          </div>

          <button type="button" onClick={() => setFiltersOpen(true)}>
            <SlidersHorizontal className="h-4 w-4" />
            Filtros
          </button>
        </div>
      </section>

      {filtersOpen && (
        <div className="mobile-filter-sheet" role="dialog" aria-modal="true">
          <button
            type="button"
            className="mobile-filter-sheet__backdrop"
            onClick={() => setFiltersOpen(false)}
            aria-label="Fechar filtros"
          />

          <form action="/lancamentos" className="mobile-filter-sheet__panel">
            <div className="mobile-filter-sheet__handle" />

            <div className="mobile-filter-sheet__header">
              <div>
                <p className="mobile-eyebrow">Filtros</p>
                <h3>Refinar lista</h3>
              </div>

              <button
                type="button"
                onClick={() => setFiltersOpen(false)}
                aria-label="Fechar filtros"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <input type="hidden" name="search" value={filters.search} />
            <input
              type="hidden"
              name="paymentMethod"
              value={filters.paymentMethod}
            />

            <div className="mobile-filter-sheet__grid">
              <div>
                <label>Mes</label>
                <select name="month" defaultValue={filters.month}>
                  <option value="ALL">Ano todo</option>
                  <option value="01">Jan</option>
                  <option value="02">Fev</option>
                  <option value="03">Mar</option>
                  <option value="04">Abr</option>
                  <option value="05">Mai</option>
                  <option value="06">Jun</option>
                  <option value="07">Jul</option>
                  <option value="08">Ago</option>
                  <option value="09">Set</option>
                  <option value="10">Out</option>
                  <option value="11">Nov</option>
                  <option value="12">Dez</option>
                </select>
              </div>

              <div>
                <label>Ano</label>
                <select name="year" defaultValue={filters.year}>
                  {yearOptions.map((year) => (
                    <option key={year} value={String(year)}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label>Status</label>
                <select name="status" defaultValue={filters.status}>
                  <option value="ALL">Todos</option>
                  <option value="PAID">Pago</option>
                  <option value="PENDING">Pendente</option>
                  <option value="OVERDUE">Atrasado</option>
                  <option value="CANCELED">Cancelado</option>
                </select>
              </div>

              <div>
                <label>Tipo</label>
                <select name="type" defaultValue={filters.type}>
                  <option value="ALL">Todos</option>
                  <option value="INCOME">Entradas</option>
                  <option value="EXPENSE">Saidas</option>
                </select>
              </div>

              <div>
                <label>Responsavel</label>
                <select name="responsibleId" defaultValue={filters.responsibleId}>
                  <option value="ALL">Todos</option>
                  {responsibleOptions.map((responsible) => (
                    <option key={responsible.id} value={responsible.id}>
                      {responsible.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label>Categoria</label>
                <select name="categoryId" defaultValue={filters.categoryId}>
                  <option value="ALL">Todas</option>
                  {categoryOptions.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mobile-filter-sheet__actions">
              <Link href="/lancamentos">
                <RotateCcw className="h-4 w-4" />
                Limpar
              </Link>

              <button type="submit">
                <Filter className="h-4 w-4" />
                Aplicar
              </button>
            </div>
          </form>
        </div>
      )}

      <section className="mobile-transactions-responsibles">
        <div className="mobile-section__header">
          <div>
            <p className="mobile-eyebrow">Responsaveis</p>
            <h3>Resumo por pessoa</h3>
          </div>

          <span>
            {getActiveResponsibleName(
              responsibleOptions,
              filters.responsibleId,
            )}
          </span>
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
            <p className="mobile-eyebrow">Historico</p>
            <h3>Movimentacoes</h3>
          </div>

          <Link href="/lancamentos/novo" className="mobile-see-all">
            Novo
          </Link>
        </div>

        {!hasTransactions && (
          <div className="mobile-empty-state">
            <strong>Nenhum lancamento encontrado</strong>
            <p>Ajuste os filtros ou cadastre uma nova entrada ou saida.</p>
            <Link href="/lancamentos/novo">Criar lancamento</Link>
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

                    {transaction.repeatLabel && (
                      <span className="mobile-transaction-row__tag">
                        {transaction.repeatLabel}
                      </span>
                    )}

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
