import {
  ArrowDownCircle,
  ArrowUpCircle,
  PiggyBank,
  Wallet,
  type LucideIcon,
} from "lucide-react";

export type SummaryCardItem = {
  title: string;
  value: string;
  description: string;
  icon: LucideIcon;
  detail: string;
  valueClassName: string;
};

export type QuickStatItem = {
  label: string;
  value: string;
  className: string;
};

export const summaryCards: SummaryCardItem[] = [
  {
    title: "Saldo previsto",
    value: "R$ 0,00",
    description: "Entradas menos saídas do mês",
    icon: Wallet,
    detail: "Atualizado em tempo real",
    valueClassName: "text-white",
  },
  {
    title: "Entradas",
    value: "R$ 0,00",
    description: "Receitas registradas",
    icon: ArrowUpCircle,
    detail: "0 lançamentos",
    valueClassName: "finance-income",
  },
  {
    title: "Saídas",
    value: "R$ 0,00",
    description: "Despesas registradas",
    icon: ArrowDownCircle,
    detail: "0 lançamentos",
    valueClassName: "finance-expense",
  },
  {
    title: "Metas",
    value: "R$ 0,00",
    description: "Valor reservado até agora",
    icon: PiggyBank,
    detail: "0 metas ativas",
    valueClassName: "finance-goal",
  },
];

export const quickStats: QuickStatItem[] = [
  {
    label: "Contas pendentes",
    value: "0",
    className: "finance-pending",
  },
  {
    label: "Cartões ativos",
    value: "0",
    className: "finance-credit-card",
  },
  {
    label: "Metas em andamento",
    value: "0",
    className: "finance-goal",
  },
];