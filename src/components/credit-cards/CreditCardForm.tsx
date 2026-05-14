"use client";

import { CreditCard, Plus } from "lucide-react";
import { createCreditCardAction } from "@/actions/credit-cards-actions";

type CreditCardFormProps = {
  familyId: string;
};

export function CreditCardForm({ familyId }: CreditCardFormProps) {
  return (
    <form action={createCreditCardAction} className="app-card p-6">
      <input type="hidden" name="familyId" value={familyId} />

      <div className="flex items-start gap-4">
        <div className="app-icon-box h-12 w-12">
          <CreditCard className="h-5 w-5" />
        </div>

        <div>
          <h3 className="text-xl font-black tracking-[-0.03em] text-white">
            Novo cartão
          </h3>

          <p className="mt-1 text-sm app-faint-text">
            Cadastre cartões de crédito para controlar limites, fechamento e
            vencimentos.
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-5">
        <div>
          <label className="mb-2 block text-sm font-bold text-white">
            Nome do cartão
          </label>

          <input
            required
            name="name"
            placeholder="Ex: Nubank, Inter, Caixa..."
            className="finance-input"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-bold text-white">
            Banco
          </label>

          <input
            name="bank"
            placeholder="Ex: Nubank, Banco do Brasil..."
            className="finance-input"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-bold text-white">
            Limite
          </label>

          <input
            name="limitAmount"
            placeholder="Ex: 2000,00"
            inputMode="decimal"
            className="finance-input"
          />
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-bold text-white">
              Dia de fechamento
            </label>

            <input
              required
              name="closingDay"
              type="number"
              min={1}
              max={31}
              placeholder="Ex: 25"
              className="finance-input"
            />

            <p className="mt-2 text-xs app-faint-text">
              Dia em que a fatura fecha.
            </p>
          </div>

          <div>
            <label className="mb-2 block text-sm font-bold text-white">
              Dia de vencimento
            </label>

            <input
              required
              name="dueDay"
              type="number"
              min={1}
              max={31}
              placeholder="Ex: 10"
              className="finance-input"
            />

            <p className="mt-2 text-xs app-faint-text">
              Dia em que a fatura vence.
            </p>
          </div>
        </div>

        <button type="submit" className="app-button-primary w-full">
          <Plus className="h-4 w-4" />
          Criar cartão
        </button>
      </div>
    </form>
  );
}