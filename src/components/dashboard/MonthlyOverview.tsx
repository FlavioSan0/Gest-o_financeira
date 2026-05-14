type MonthlyOverviewProps = {
  monthLabel: string;
  pendingBillsCount: number;
  activeCardsCount: number;
  activeGoalsCount: number;
};

export function MonthlyOverview({
  monthLabel,
  pendingBillsCount,
  activeCardsCount,
  activeGoalsCount,
}: MonthlyOverviewProps) {
  const quickStats = [
    {
      label: "Contas pendentes",
      value: String(pendingBillsCount),
      className: "finance-pending",
    },
    {
      label: "Cartões ativos",
      value: String(activeCardsCount),
      className: "finance-credit-card",
    },
    {
      label: "Metas em andamento",
      value: String(activeGoalsCount),
      className: "finance-goal",
    },
  ];

  return (
    <aside className="app-card p-6">
      <h2 className="text-xl font-bold tracking-[-0.02em] text-white">
        Resumo do mês
      </h2>

      <p className="mt-1 text-sm app-faint-text">{monthLabel}</p>

      <div className="mt-6 grid gap-4">
        {quickStats.map((item) => (
          <div
            key={item.label}
            className="rounded-3xl border border-white/10 bg-black/25 p-5"
          >
            <p className="text-sm app-faint-text">{item.label}</p>

            <strong
              className={`mt-2 block text-3xl font-black ${item.className}`}
            >
              {item.value}
            </strong>
          </div>
        ))}
      </div>
    </aside>
  );
}