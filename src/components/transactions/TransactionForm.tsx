import { TransactionFormDesktop } from "@/components/transactions/desktop/TransactionFormDesktop";
import { TransactionFormMobile } from "@/components/transactions/mobile/TransactionFormMobile";

type AccountOption = {
  id: string;
  name: string;
  type: string;
};

type CategoryOption = {
  id: string;
  name: string;
  type: "INCOME" | "EXPENSE";
};

type CreditCardOption = {
  id: string;
  name: string;
  bank: string;
  closingDay: number;
  dueDay: number;
};

type TransactionType = "INCOME" | "EXPENSE";

type TransactionFormProps = {
  familyId: string;
  accounts: AccountOption[];
  categories: CategoryOption[];
  creditCards: CreditCardOption[];
  defaultType?: TransactionType;
};

export function TransactionForm(props: TransactionFormProps) {
  return (
    <>
      <div className="desktop-only">
        <TransactionFormDesktop {...props} />
      </div>

      <div className="mobile-only">
        <TransactionFormMobile {...props} />
      </div>
    </>
  );
}