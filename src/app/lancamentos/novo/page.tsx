import { AppShell } from "@/components/layout/AppShell";
import { TransactionForm } from "@/components/transactions/TransactionForm";
import { getTransactionFormOptions } from "@/services/transactions-service";

type NewTransactionPageProps = {
  searchParams?: Promise<{
    type?: string;
  }>;
};

function resolveDefaultType(type?: string) {
  return type === "INCOME" ? "INCOME" : "EXPENSE";
}

export default async function NewTransactionPage({
  searchParams,
}: NewTransactionPageProps) {
  const params = await searchParams;
  const defaultType = resolveDefaultType(params?.type);

  const options = await getTransactionFormOptions();

  return (
    <AppShell>
      <div className="app-container">
        <TransactionForm {...options} defaultType={defaultType} />
      </div>
    </AppShell>
  );
}