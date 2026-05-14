import {
  BarChart3,
  CreditCard,
  Home,
  PiggyBank,
  ReceiptText,
  Settings,
  Tags,
  WalletCards,
  type LucideIcon,
} from "lucide-react";

export type NavigationItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  active: boolean;
};

export const navigationItems: NavigationItem[] = [
  {
    label: "Dashboard",
    href: "/",
    icon: Home,
    active: true,
  },
  {
    label: "Lançamentos",
    href: "/lancamentos",
    icon: ReceiptText,
    active: false,
  },
  {
    label: "Categorias",
    href: "/categorias",
    icon: Tags,
    active: false,
  },
  {
    label: "Contas",
    href: "/contas",
    icon: WalletCards,
    active: false,
  },
  {
    label: "Cartões",
    href: "/cartoes",
    icon: CreditCard,
    active: false,
  },
  {
    label: "Metas",
    href: "/metas",
    icon: PiggyBank,
    active: false,
  },
  {
    label: "Relatórios",
    href: "/relatorios",
    icon: BarChart3,
    active: false,
  },
  {
    label: "Configurações",
    href: "/configuracoes",
    icon: Settings,
    active: false,
  },
];