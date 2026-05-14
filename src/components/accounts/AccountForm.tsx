"use client";

import { Plus, WalletCards } from "lucide-react";
import { createAccountAction } from "@/actions/accounts-actions";

type AccountFormProps = {
  familyId: string;
};

export function AccountForm({ familyId }: AccountFormProps) {
  return (
    <form action={createAccountAction} className="app-card p-6">
      <input type="hidden" name="familyId" value={familyId} />

      <div className="flex items-start gap-4">
        <div className="app-icon-box h-12 w-12">
          <WalletCards className="h-5 w-5" />
        </div>

        <div>
          <h3 className="text-xl font-black tracking-[-0.03em] text-white">
            Nova conta
          </h3>

          <p className="mt-1 text-sm app-faint-text">
            Cadastre bancos, carteiras, dinheiro físico ou contas de controle.
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-5">
        <div>
          <label className="mb-2 block text-sm font-bold text-white">
            Nome da conta
          </label>

          <input
            required
            name="name"
            placeholder="Ex: Nubank, Caixa, Carteira..."
            className="finance-input"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-bold text-white">
            Tipo da conta
          </label>

          <select name="type" defaultValue="CHECKING" className="finance-input">
            <option value="CHECKING">Conta corrente</option>
            <option value="SAVINGS">Poupança</option>
            <option value="CASH">Dinheiro físico</option>
            <option value="WALLET">Carteira digital</option>
            <option value="INVESTMENT">Investimento</option>
            <option value="OTHER">Outro</option>
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-bold text-white">
            Saldo inicial
          </label>

          <input
            name="initialBalance"
            placeholder="Ex: 500,00"
            inputMode="decimal"
            className="finance-input"
          />

          <p className="mt-2 text-xs app-faint-text">
            Esse valor será usado como saldo atual inicial da conta.
          </p>
        </div>

        <button type="submit" className="app-button-primary w-full">
          <Plus className="h-4 w-4" />
          Criar conta
        </button>
      </div>
    </form>
  );
}