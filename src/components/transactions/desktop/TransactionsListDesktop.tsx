import Link from "next/link";
import {
  ArrowDownCircle,
  ArrowUpCircle,
  CalendarDays,
  CreditCard,
  Pencil,
  Plus,
  ReceiptText,
  Wallet,
} from "lucide-react";
import { TransactionsFilters } from "@/components/transactions/TransactionsFilters";
import { DeleteTransactionButton } from "@/components/transactions/DeleteTransactionButton";
import { TransactionsResponsibleSummary } from "@/components/transactions/TransactionsResponsibleSummary";

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

type ResponsibleSummaryCard = {
  id: string;
  name: string;
  income: string;
  expense: string;
  balance: string;
  transactionsCount: number;
  isGeneral: boolean;
};

type TransactionsListDesktopProps = {
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
    month: string;
    year: string;
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

function getStatusClassName(status: TransactionItem["status"]) {
  const classes = {
    PAID: "finance-badge finance-badge-income",
    PENDING: "finance-badge finance-badge-pending",
    OVERDUE: "finance-badge finance-badge-expense",
    CANCELED: "finance-badge finance-badge-neutral",
  };

  return classes[status];
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

export function TransactionsListDesktop({
  transactions,
  summary,
  responsibleSummaryCards,
  filters,
  responsibleOptions,
}: TransactionsListDesktopProps) {
  const hasTransactions = transactions.length > 0;

  return (
    <div className="grid gap-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <p className="text-sm font-medium app-faint-text">
            Controle financeiro
          </p>

          <h2 className="mt-1 text-3xl font-black tracking-[-0.04em] text-white">
            Lançamentos
          </h2>

          <p className="mt-2 text-sm app-muted-text">
            Consulte, edite e organize todas as entradas e saídas cadastradas.
          </p>
        </div>

        <Link href="/lancamentos/novo" className="app-button-primary">
          <Plus className="h-4 w-4" />
          Novo lançamento
        </Link>
      </div>

      <TransactionsResponsibleSummary
        cards={responsibleSummaryCards}
        activeResponsibleId={filters.responsibleId}
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <article className="app-card p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-bold app-faint-text">Saldo filtrado</p>
              <strong className="mt-2 block text-2xl font-black text-white">
                {summary.balance}
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
              <p className="text-sm font-bold app-faint-text">
                Entradas filtradas
              </p>
              <strong className="mt-2 block text-2xl font-black finance-income">
                {summary.totalIncome}
              </strong>
            </div>

            <div className="app-icon-box h-11 w-11">
              <ArrowUpCircle className="h-5 w-5" />
            </div>
          </div>
        </article>

        <article className="app-card p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-bold app-faint-text">
                Saídas filtradas
              </p>
              <strong className="mt-2 block text-2xl font-black finance-expense">
                {summary.totalExpense}
              </strong>
            </div>

            <div className="app-icon-box h-11 w-11">
              <ArrowDownCircle className="h-5 w-5" />
            </div>
          </div>
        </article>

        <article className="app-card p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-bold app-faint-text">
                Registros filtrados
              </p>
              <strong className="mt-2 block text-2xl font-black text-white">
                {summary.totalTransactions}
              </strong>
            </div>

            <div className="app-icon-box h-11 w-11">
              <ReceiptText className="h-5 w-5" />
            </div>
          </div>
        </article>
      </section>

      <TransactionsFilters
        filters={filters}
        responsibleOptions={responsibleOptions}
      />

      <section className="app-card p-6">
        <div className="flex flex-col justify-between gap-4 border-b border-white/10 pb-5 md:flex-row md:items-center">
          <div>
            <h3 className="text-xl font-black tracking-[-0.03em] text-white">
              Histórico de lançamentos
            </h3>

            <p className="mt-1 text-sm app-faint-text">
              Registros ordenados dos mais recentes para os mais antigos.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <span className="finance-badge border border-white/10 bg-white/5 text-white/70">
              {summary.totalTransactions} encontrados
            </span>
          </div>
        </div>

        {!hasTransactions && (
          <div className="mt-6 flex min-h-65 flex-col items-center justify-center rounded-[1.75rem] border border-dashed border-white/15 bg-black/25 p-8 text-center">
            <div className="app-icon-box h-16 w-16 rounded-3xl">
              <ReceiptText className="h-8 w-8" />
            </div>

            <h3 className="mt-5 text-lg font-bold text-white">
              Nenhum lançamento encontrado
            </h3>

            <p className="mt-2 max-w-md text-sm leading-6 app-faint-text">
              Ajuste os filtros ou cadastre uma nova entrada ou saída.
            </p>

            <Link href="/lancamentos/novo" className="app-button-primary mt-6">
              <Plus className="h-4 w-4" />
              Criar lançamento
            </Link>
          </div>
        )}

        {hasTransactions && (
          <div className="mt-5 grid gap-3">
            {transactions.map((transaction) => (
              <article
                key={transaction.id}
                className="rounded-3xl border border-white/10 bg-black/25 p-4 transition hover:border-white/20 hover:bg-white/4"
              >
                <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <strong className="text-base font-black text-white">
                        {transaction.description}
                      </strong>

                      <span
                        className={
                          transaction.type === "INCOME"
                            ? "finance-badge finance-badge-income"
                            : "finance-badge finance-badge-expense"
                        }
                      >
                        {transaction.type === "INCOME" ? "Entrada" : "Saída"}
                      </span>

                      <span className={getStatusClassName(transaction.status)}>
                        {getStatusLabel(transaction.status)}
                      </span>

                      {transaction.repeatLabel && (
                        <span className="finance-badge border border-white/10 bg-white/5 text-white/70">
                          {transaction.repeatLabel}
                        </span>
                      )}
                    </div>

                    <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-xs app-faint-text">
                      <span className="inline-flex items-center gap-1.5">
                        <CalendarDays className="h-3.5 w-3.5" />
                        {transaction.date}
                      </span>

                      <span>{transaction.category}</span>

                      <span>{transaction.account}</span>

                      <span>{transaction.responsible}</span>

                      <span className="inline-flex items-center gap-1.5">
                        <CreditCard className="h-3.5 w-3.5" />
                        {getPaymentMethodLabel(transaction.paymentMethod)}
                      </span>
                    </div>

                    {transaction.notes && (
                      <p className="mt-3 text-xs leading-5 app-muted-text">
                        {transaction.notes}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between gap-3 xl:min-w-65 xl:justify-end">
                    <strong
                      className={
                        transaction.type === "INCOME"
                          ? "text-xl font-black finance-income"
                          : "text-xl font-black finance-expense"
                      }
                    >
                      {transaction.type === "INCOME" ? "+" : "-"}{" "}
                      {transaction.amount}
                    </strong>

                    <div className="flex items-center gap-2">
                      <Link
                        href={`/lancamentos/${transaction.id}/editar`}
                        className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-white transition hover:bg-white hover:text-black"
                        title="Editar lançamento"
                      >
                        <Pencil className="h-4 w-4" />
                      </Link>

                      <DeleteTransactionButton
                        transactionId={transaction.id}
                        transactionDescription={transaction.description}
                      />
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}