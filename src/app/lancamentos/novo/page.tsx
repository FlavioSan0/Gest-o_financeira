import { AppShell } from "@/components/layout/AppShell";
import { TransactionForm } from "@/components/transactions/TransactionForm";
import { getTransactionFormOptions } from "@/services/transactions-service";

export default async function NewTransactionPage() {
  const options = await getTransactionFormOptions();

  return (
    <AppShell>
      <div className="app-container">
        <TransactionForm
          familyId={options.familyId}
          accounts={options.accounts}
          categories={options.categories}
          creditCards={options.creditCards}
          users={options.users}
        />
      </div>
    </AppShell>
  );
}