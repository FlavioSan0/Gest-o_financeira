import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { CardInvoiceFilters } from "@/components/card-invoices/CardInvoiceFilters";
import { CardInvoiceOverview } from "@/components/card-invoices/CardInvoiceOverview";
import { CardInvoiceTransactionsList } from "@/components/card-invoices/CardInvoiceTransactionsList";
import { PayCardInvoiceCard } from "@/components/card-invoices/PayCardInvoiceCard";
import {
  getCardInvoicesPageData,
  type CardInvoiceFilters as CardInvoiceFiltersType,
} from "@/services/card-invoices-service";

type CardInvoicesPageProps = {
  searchParams: Promise<{
    creditCardId?: string;
    month?: string;
    year?: string;
  }>;
};

function normalizeMonth(value?: string) {
  const month = Number(value);

  if (!Number.isInteger(month) || month < 1 || month > 12) {
    return undefined;
  }

  return month;
}

function normalizeYear(value?: string) {
  const year = Number(value);

  if (!Number.isInteger(year) || year < 2000 || year > 2100) {
    return undefined;
  }

  return year;
}

export default async function CardInvoicesPage({
  searchParams,
}: CardInvoicesPageProps) {
  const params = await searchParams;

  const filters: CardInvoiceFiltersType = {
    creditCardId: params.creditCardId ?? "ALL",
    month: normalizeMonth(params.month),
    year: normalizeYear(params.year),
  };

  const data = await getCardInvoicesPageData(filters);

  return (
    <AppShell>
      <div className="app-container grid gap-6">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <Link
              href="/cartoes"
              className="inline-flex items-center gap-2 text-sm font-bold app-faint-text transition hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar para cartões
            </Link>

            <p className="mt-4 text-sm font-medium app-faint-text">
              Crédito e faturas
            </p>

            <h2 className="mt-1 text-3xl font-black tracking-[-0.04em] text-white">
              Faturas
            </h2>

            <p className="mt-2 text-sm app-muted-text">
              Acompanhe compras feitas no cartão de crédito por mês e por
              cartão.
            </p>
          </div>
        </div>

        <CardInvoiceOverview
          monthLabel={data.monthLabel}
          overview={data.overview}
        />

        <CardInvoiceFilters
          filters={data.filters}
          creditCards={data.creditCards}
          availableYears={data.availableYears}
        />

        <PayCardInvoiceCard
          canPayInvoice={data.canPayInvoice}
          creditCardId={data.filters.creditCardId}
          month={data.filters.month}
          year={data.filters.year}
          totalAmount={data.overview.totalAmount}
          invoiceStatusLabel={data.invoiceStatusLabel}
          accounts={data.accounts}
        />

        <CardInvoiceTransactionsList transactions={data.transactions} />
      </div>
    </AppShell>
  );
}