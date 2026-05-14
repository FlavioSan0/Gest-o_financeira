import { notFound } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { TransactionEditForm } from "@/components/transactions/TransactionEditForm";
import { getTransactionForEdit } from "@/services/transactions-service";

type EditTransactionPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditTransactionPage({
  params,
}: EditTransactionPageProps) {
  const { id } = await params;

  const data = await getTransactionForEdit(id);

  if (!data) {
    notFound();
  }

  return (
    <AppShell>
      <div className="app-container">
        <TransactionEditForm
          transaction={data.transaction}
          accounts={data.options.accounts}
          categories={data.options.categories}
          creditCards={data.options.creditCards}
          users={data.options.users}
        />
      </div>
    </AppShell>
  );
}