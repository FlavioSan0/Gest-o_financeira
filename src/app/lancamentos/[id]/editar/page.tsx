import { notFound } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { TransactionEditForm } from "@/components/transactions/TransactionEditForm";
import { getTransactionForEdit } from "@/services/transactions-service";

type EditTransactionPageProps = {
  params: Promise<{
    id: string;
  }>;
  searchParams?: Promise<{
    type?: string;
  }>;
};

type TransactionType = "INCOME" | "EXPENSE";

function resolveEditType(
  queryType: string | undefined,
  transactionType: TransactionType,
): TransactionType {
  if (queryType === "INCOME" || queryType === "EXPENSE") {
    return queryType;
  }

  return transactionType;
}

export default async function EditTransactionPage({
  params,
  searchParams,
}: EditTransactionPageProps) {
  const { id } = await params;
  const query = await searchParams;

  const data = await getTransactionForEdit(id);

  if (!data) {
    notFound();
  }

  const defaultType = resolveEditType(query?.type, data.transaction.type);

  return (
    <AppShell>
      <div className="app-container">
        <TransactionEditForm
          transaction={data.transaction}
          accounts={data.options.accounts}
          categories={data.options.categories}
          creditCards={data.options.creditCards}
          defaultType={defaultType}
        />
      </div>
    </AppShell>
  );
}