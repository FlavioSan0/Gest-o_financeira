import { Filter, RotateCcw } from "lucide-react";
import Link from "next/link";

type CreditCardOption = {
  id: string;
  name: string;
  bank: string;
  closingDay: number;
  dueDay: number;
};

type CardInvoiceFiltersProps = {
  filters: {
    creditCardId: string;
    month: number;
    year: number;
  };
  creditCards: CreditCardOption[];
  availableYears: number[];
};

const months = [
  { value: 1, label: "Janeiro" },
  { value: 2, label: "Fevereiro" },
  { value: 3, label: "Março" },
  { value: 4, label: "Abril" },
  { value: 5, label: "Maio" },
  { value: 6, label: "Junho" },
  { value: 7, label: "Julho" },
  { value: 8, label: "Agosto" },
  { value: 9, label: "Setembro" },
  { value: 10, label: "Outubro" },
  { value: 11, label: "Novembro" },
  { value: 12, label: "Dezembro" },
];

export function CardInvoiceFilters({
  filters,
  creditCards,
  availableYears,
}: CardInvoiceFiltersProps) {
  return (
    <form className="app-card p-5" action="/cartoes/faturas">
      <div className="grid gap-4 lg:grid-cols-[1fr_0.7fr_0.7fr_auto] lg:items-end">
        <div>
          <label className="mb-2 block text-sm font-bold text-white">
            Cartão
          </label>

          <select
            name="creditCardId"
            defaultValue={filters.creditCardId}
            className="finance-input"
          >
            <option value="ALL">Todos os cartões</option>

            {creditCards.map((card) => (
              <option key={card.id} value={card.id}>
                {card.name} • {card.bank}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-bold text-white">
            Mês
          </label>

          <select
            name="month"
            defaultValue={filters.month}
            className="finance-input"
          >
            {months.map((month) => (
              <option key={month.value} value={month.value}>
                {month.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-bold text-white">
            Ano
          </label>

          <select
            name="year"
            defaultValue={filters.year}
            className="finance-input"
          >
            {availableYears.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>

        <div className="flex gap-2">
          <button type="submit" className="app-button-primary w-full lg:w-auto">
            <Filter className="h-4 w-4" />
            Filtrar
          </button>

          <Link href="/cartoes/faturas" className="app-button-secondary">
            <RotateCcw className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </form>
  );
}