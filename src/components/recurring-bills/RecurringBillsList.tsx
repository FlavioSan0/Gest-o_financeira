import { RecurringBillsListDesktop } from "@/components/recurring-bills/desktop/RecurringBillsListDesktop";
import { RecurringBillsListMobile } from "@/components/recurring-bills/mobile/RecurringBillsListMobile";

type RecurringBillItem = {
  id: string;
  description: string;
  amount: string;
  rawAmount: number;
  dueDay: number;
  frequency: string;
  active: boolean;
  category: string;
  categoryColor: string;
  categoryIcon: string;
  nextDueDate: string;
  daysUntilDue: number;
  alreadyGeneratedThisMonth: boolean;
};

type RecurringBillsListProps = {
  recurringBills: RecurringBillItem[];
  summary: {
    total: number;
    active: number;
    inactive: number;
    monthlyForecast: string;
  };
};

export function RecurringBillsList(props: RecurringBillsListProps) {
  return (
    <>
      <div className="desktop-only">
        <RecurringBillsListDesktop {...props} />
      </div>

      <div className="mobile-only">
        <RecurringBillsListMobile {...props} />
      </div>
    </>
  );
}