import { TransactionsListDesktop } from "@/components/transactions/desktop/TransactionsListDesktop";
import { TransactionsListMobile } from "@/components/transactions/mobile/TransactionsListMobile";

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
  repeatLabel?: string | null;
  notes: string | null;
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

type TransactionsListProps = {
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

export function TransactionsList(props: TransactionsListProps) {
  return (
    <>
      <div className="desktop-only">
        <TransactionsListDesktop {...props} />
      </div>

      <div className="mobile-only">
        <TransactionsListMobile {...props} />
      </div>
    </>
  );
}
