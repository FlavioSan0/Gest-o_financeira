import { AccountsListDesktop } from "@/components/accounts/desktop/AccountsListDesktop";
import { AccountsListMobile } from "@/components/accounts/mobile/AccountsListMobile";

type AccountItem = {
  id: string;
  name: string;
  type: "CHECKING" | "SAVINGS" | "CASH" | "WALLET" | "INVESTMENT" | "OTHER";
  initialBalance: string;
  currentBalance: string;
  rawInitialBalance: number;
  rawCurrentBalance: number;
  active: boolean;
};

type AccountsListProps = {
  accounts: AccountItem[];
  summary: {
    total: number;
    active: number;
    inactive: number;
    totalCurrentBalance: string;
    totalInitialBalance: string;
  };
};

export function AccountsList(props: AccountsListProps) {
  return (
    <>
      <div className="desktop-only">
        <AccountsListDesktop {...props} />
      </div>

      <div className="mobile-only">
        <AccountsListMobile {...props} />
      </div>
    </>
  );
}