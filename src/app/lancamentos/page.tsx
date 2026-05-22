import { AppShell } from "@/components/layout/AppShell";
import { AutoRefresh } from "@/components/common/AutoRefresh";
import { TransactionsList } from "@/components/transactions/TransactionsList";
import {
  getTransactionsList,
  type TransactionsFilters,
} from "@/services/transactions-service";

type TransactionsPageProps = {
  searchParams: Promise<{
    search?: string;
    type?: string;
    status?: string;
    paymentMethod?: string;
    responsibleId?: string;
    categoryId?: string;
    month?: string;
    year?: string;
  }>;
};

function normalizeType(value?: string): TransactionsFilters["type"] {
  if (value === "INCOME" || value === "EXPENSE") {
    return value;
  }

  return "ALL";
}

function normalizeStatus(value?: string): TransactionsFilters["status"] {
  if (
    value === "PAID" ||
    value === "PENDING" ||
    value === "OVERDUE" ||
    value === "CANCELED"
  ) {
    return value;
  }

  return "ALL";
}

function normalizePaymentMethod(
  value?: string,
): TransactionsFilters["paymentMethod"] {
  if (
    value === "PIX" ||
    value === "CASH" ||
    value === "DEBIT_CARD" ||
    value === "CREDIT_CARD" ||
    value === "BANK_TRANSFER" ||
    value === "BOLETO" ||
    value === "OTHER"
  ) {
    return value;
  }

  return "ALL";
}

function normalizeMonth(value?: string) {
  if (value === "ALL") {
    return "ALL";
  }

  if (/^(0[1-9]|1[0-2])$/.test(value ?? "")) {
    return value!;
  }

  return String(new Date().getMonth() + 1).padStart(2, "0");
}

function normalizeYear(value?: string) {
  if (/^\d{4}$/.test(value ?? "")) {
    return value!;
  }

  return String(new Date().getFullYear());
}

function normalizeResponsibleId(value?: string) {
  if (!value || value.trim() === "") {
    return "ALL";
  }

  return value;
}

function normalizeCategoryId(value?: string) {
  if (!value || value.trim() === "") {
    return "ALL";
  }

  return value;
}

export default async function TransactionsPage({
  searchParams,
}: TransactionsPageProps) {
  const params = await searchParams;

  const filters: TransactionsFilters = {
    search: params.search ?? "",
    type: normalizeType(params.type),
    status: normalizeStatus(params.status),
    paymentMethod: normalizePaymentMethod(params.paymentMethod),
    responsibleId: normalizeResponsibleId(params.responsibleId),
    categoryId: normalizeCategoryId(params.categoryId),
    month: normalizeMonth(params.month),
    year: normalizeYear(params.year),
  };

  const data = await getTransactionsList(filters);

  return (
    <AppShell>
      <div className="app-container">
        <AutoRefresh intervalMs={30000} showStatus className="mb-4" />

        <TransactionsList
          transactions={data.transactions}
          summary={data.summary}
          responsibleSummaryCards={data.responsibleSummaryCards}
          filters={data.filters}
          responsibleOptions={data.responsibleOptions}
          categoryOptions={data.categoryOptions}
        />
      </div>
    </AppShell>
  );
}
