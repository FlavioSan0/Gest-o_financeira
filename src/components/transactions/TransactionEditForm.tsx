import { TransactionEditFormDesktop } from "@/components/transactions/desktop/TransactionEditFormDesktop";
import { TransactionEditFormMobile } from "@/components/transactions/mobile/TransactionEditFormMobile";

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

type PaymentMethod =
  | "PIX"
  | "CASH"
  | "DEBIT_CARD"
  | "CREDIT_CARD"
  | "BANK_TRANSFER"
  | "BOLETO"
  | "OTHER";

type TransactionEditData = {
  id: string;
  familyId: string;
  accountId: string;
  creditCardId: string;
  categoryId: string;
  type: TransactionType;
  description: string;
  amount: string;
  transactionDate: string;
  dueDate: string;
  status: "PAID" | "PENDING" | "OVERDUE" | "CANCELED";
  paymentMethod: PaymentMethod;
  notes: string;
};

type TransactionEditFormProps = {
  transaction: TransactionEditData;
  accounts: AccountOption[];
  categories: CategoryOption[];
  creditCards: CreditCardOption[];
  defaultType?: TransactionType;
};

export function TransactionEditForm(props: TransactionEditFormProps) {
  return (
    <>
      <div className="desktop-only">
        <TransactionEditFormDesktop {...props} />
      </div>

      <div className="mobile-only">
        <TransactionEditFormMobile {...props} />
      </div>
    </>
  );
}