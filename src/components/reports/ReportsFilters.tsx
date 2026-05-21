import { Filter, Search } from "lucide-react";
import type { ReportsData } from "@/services/reports-service";

type ReportsFiltersProps = {
  filters: ReportsData["filters"];
  options: ReportsData["options"];
};

function FiltersFields({ filters, options }: ReportsFiltersProps) {
  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-6">
      <div>
        <label className="mb-2 block text-xs font-bold uppercase tracking-[0.16em] app-faint-text">
          Mes
        </label>
        <select name="month" defaultValue={filters.month} className="finance-input">
          {options.months.map((month) => (
            <option key={month.value} value={month.value}>
              {month.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-2 block text-xs font-bold uppercase tracking-[0.16em] app-faint-text">
          Ano
        </label>
        <select name="year" defaultValue={filters.year} className="finance-input">
          {options.years.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-2 block text-xs font-bold uppercase tracking-[0.16em] app-faint-text">
          Responsavel
        </label>
        <select
          name="responsibleId"
          defaultValue={filters.responsibleId}
          className="finance-input"
        >
          {options.responsibles.map((responsible) => (
            <option key={responsible.id} value={responsible.id}>
              {responsible.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-2 block text-xs font-bold uppercase tracking-[0.16em] app-faint-text">
          Categoria
        </label>
        <select
          name="categoryId"
          defaultValue={filters.categoryId}
          className="finance-input"
        >
          <option value="ALL">Todas</option>
          {options.categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-2 block text-xs font-bold uppercase tracking-[0.16em] app-faint-text">
          Tipo
        </label>
        <select name="type" defaultValue={filters.type} className="finance-input">
          <option value="ALL">Todos</option>
          <option value="INCOME">Entrada</option>
          <option value="EXPENSE">Saida</option>
        </select>
      </div>

      <div>
        <label className="mb-2 block text-xs font-bold uppercase tracking-[0.16em] app-faint-text">
          Status
        </label>
        <select
          name="status"
          defaultValue={filters.status}
          className="finance-input"
        >
          <option value="ALL">Todos</option>
          <option value="PAID">Realizado</option>
          <option value="PENDING">Pendente</option>
        </select>
      </div>
    </div>
  );
}

export function ReportsFilters({ filters, options }: ReportsFiltersProps) {
  return (
    <>
      <form action="/relatorios" className="app-card desktop-only p-5">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] app-faint-text">
              Filtros
            </p>
            <h3 className="mt-1 text-lg font-black text-white">Periodo</h3>
          </div>

          <button type="submit" className="app-button-primary">
            <Search className="h-4 w-4" />
            Aplicar
          </button>
        </div>

        <FiltersFields filters={filters} options={options} />
      </form>

      <details className="app-card mobile-only p-4">
        <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-black text-white">
          <span className="inline-flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filtros
          </span>
          <span className="text-xs app-muted-text">abrir</span>
        </summary>

        <form action="/relatorios" className="mt-4 grid gap-4">
          <FiltersFields filters={filters} options={options} />

          <button type="submit" className="app-button-primary w-full">
            <Search className="h-4 w-4" />
            Aplicar
          </button>
        </form>
      </details>
    </>
  );
}
