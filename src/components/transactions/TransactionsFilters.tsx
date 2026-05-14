import { Filter, RotateCcw, Search, UserRound } from "lucide-react";
import Link from "next/link";

type ResponsibleOption = {
  id: string;
  name: string;
};

type TransactionsFiltersProps = {
  filters: {
    search: string;
    type: string;
    status: string;
    paymentMethod: string;
    responsibleId: string;
  };
  responsibleOptions: ResponsibleOption[];
};

export function TransactionsFilters({
  filters,
  responsibleOptions,
}: TransactionsFiltersProps) {
  return (
    <form className="app-card p-5" action="/lancamentos">
      <div className="grid gap-4 xl:grid-cols-[1.2fr_0.65fr_0.65fr_0.75fr_0.75fr_auto] xl:items-end">
        <div>
          <label className="mb-2 flex items-center gap-2 text-sm font-bold text-white">
            <Search className="h-4 w-4" />
            Buscar lançamento
          </label>

          <input
            name="search"
            defaultValue={filters.search}
            placeholder="Ex: mercado, salário, internet..."
            className="finance-input"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-bold text-white">
            Tipo
          </label>

          <select
            name="type"
            defaultValue={filters.type}
            className="finance-input"
          >
            <option value="ALL">Todos</option>
            <option value="INCOME">Entradas</option>
            <option value="EXPENSE">Saídas</option>
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-bold text-white">
            Status
          </label>

          <select
            name="status"
            defaultValue={filters.status}
            className="finance-input"
          >
            <option value="ALL">Todos</option>
            <option value="PAID">Pago</option>
            <option value="PENDING">Pendente</option>
            <option value="OVERDUE">Atrasado</option>
            <option value="CANCELED">Cancelado</option>
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-bold text-white">
            Pagamento
          </label>

          <select
            name="paymentMethod"
            defaultValue={filters.paymentMethod}
            className="finance-input"
          >
            <option value="ALL">Todos</option>
            <option value="PIX">Pix</option>
            <option value="CASH">Dinheiro</option>
            <option value="DEBIT_CARD">Débito</option>
            <option value="CREDIT_CARD">Crédito</option>
            <option value="BANK_TRANSFER">Transferência</option>
            <option value="BOLETO">Boleto</option>
            <option value="OTHER">Outro</option>
          </select>
        </div>

        <div>
          <label className="mb-2 flex items-center gap-2 text-sm font-bold text-white">
            <UserRound className="h-4 w-4" />
            Responsável
          </label>

          <select
            name="responsibleId"
            defaultValue={filters.responsibleId}
            className="finance-input"
          >
            <option value="ALL">Todos</option>

            {responsibleOptions.map((responsible) => (
              <option key={responsible.id} value={responsible.id}>
                {responsible.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex gap-2">
          <button type="submit" className="app-button-primary w-full xl:w-auto">
            <Filter className="h-4 w-4" />
            Filtrar
          </button>

          <Link href="/lancamentos" className="app-button-secondary">
            <RotateCcw className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </form>
  );
}