"use client";

import { useRouter } from "next/navigation";
import { CalendarDays } from "lucide-react";

type DashboardMonthSelectorProps = {
  month: number;
  year: number;
  label: string;
  compact?: boolean;
};

const monthOptions = Array.from({ length: 12 }, (_, index) => {
  const month = index + 1;
  const label = new Intl.DateTimeFormat("pt-BR", {
    month: "long",
  }).format(new Date(2026, index, 1));

  return {
    value: month,
    label: label.charAt(0).toUpperCase() + label.slice(1),
  };
});

function getYearOptions(selectedYear: number) {
  const currentYear = new Date().getFullYear();
  const years = new Set<number>();

  for (let year = currentYear - 3; year <= currentYear + 3; year += 1) {
    years.add(year);
  }

  years.add(selectedYear);

  return Array.from(years).sort((a, b) => b - a);
}

function getDashboardHref(month: number, year: number) {
  const params = new URLSearchParams({
    month: String(month).padStart(2, "0"),
    year: String(year),
  });

  return `/dashboard?${params.toString()}`;
}

export function DashboardMonthSelector({
  month,
  year,
  label,
  compact = false,
}: DashboardMonthSelectorProps) {
  const router = useRouter();
  const yearOptions = getYearOptions(year);
  const selectedMonth = String(month);
  const selectedYear = String(year);

  function navigate(nextMonth: number, nextYear: number) {
    router.push(getDashboardHref(nextMonth, nextYear));
  }

  function goToCurrentMonth() {
    const now = new Date();
    navigate(now.getMonth() + 1, now.getFullYear());
  }

  return (
    <section
      className={
        compact
          ? "dashboard-month-selector dashboard-month-selector--compact rounded-3xl border border-white/10 bg-white/[0.04] p-4"
          : "app-card flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between"
      }
    >
      <div className="dashboard-month-selector__header flex items-center gap-3">
        <div className="dashboard-month-selector__icon app-icon-box h-10 w-10">
          <CalendarDays className="h-5 w-5" />
        </div>

        <div>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-white/45">
            Refer&ecirc;ncia
          </p>
          <strong className="text-base text-white">{label}</strong>
        </div>
      </div>

      <div
        className={
          compact
            ? "dashboard-month-selector__controls mt-4 grid grid-cols-[1fr_5.5rem] gap-3"
            : "grid gap-3 sm:grid-cols-[11rem_7rem_auto]"
        }
      >
        <select
          value={selectedMonth}
          onChange={(event) => navigate(Number(event.target.value), year)}
          className="finance-input dashboard-month-selector__select"
          aria-label="Mês de referência"
        >
          {monthOptions.map((option) => (
            <option key={option.value} value={String(option.value)}>
              {option.label}
            </option>
          ))}
        </select>

        <select
          value={selectedYear}
          onChange={(event) => navigate(month, Number(event.target.value))}
          className="finance-input dashboard-month-selector__select"
          aria-label="Ano de referência"
        >
          {yearOptions.map((option) => (
            <option key={option} value={String(option)}>
              {option}
            </option>
          ))}
        </select>

        <button
          type="button"
          onClick={goToCurrentMonth}
          className={
            compact
              ? "dashboard-month-selector__current col-span-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-extrabold text-white transition hover:bg-white hover:text-slate-950"
              : "rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-extrabold text-white transition hover:bg-white hover:text-slate-950"
          }
        >
          M&ecirc;s atual
        </button>
      </div>
    </section>
  );
}
