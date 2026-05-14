"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { AlertTriangle, CheckCircle2, Wallet, X } from "lucide-react";
import { payCardInvoiceAction } from "@/actions/card-invoices-actions";

type AccountOption = {
  id: string;
  name: string;
  currentBalance: string;
};

type PayCardInvoiceCardProps = {
  canPayInvoice: boolean;
  creditCardId: string;
  month: number;
  year: number;
  totalAmount: string;
  invoiceStatusLabel: string;
  accounts: AccountOption[];
};

export function PayCardInvoiceCard({
  canPayInvoice,
  creditCardId,
  month,
  year,
  totalAmount,
  invoiceStatusLabel,
  accounts,
}: PayCardInvoiceCardProps) {
  const [isOpen, setIsOpen] = useState(false);

  const selectedCardIsValid = creditCardId !== "ALL";

  const modal =
    isOpen && typeof document !== "undefined"
      ? createPortal(
          <div className="fixed inset-0 z-9999 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
            <div className="relative z-10000 w-full max-w-lg rounded-4xl border border-white/10 bg-[#070A12] p-6 shadow-2xl shadow-purple-500/10">
              <div className="flex items-start justify-between gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-purple-500/20 bg-purple-500/10 text-purple-400">
                  <AlertTriangle className="h-6 w-6" />
                </div>

                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-white transition hover:bg-white hover:text-black"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <h3 className="mt-5 text-xl font-black tracking-[-0.03em] text-white">
                Confirmar pagamento da fatura?
              </h3>

              <p className="mt-2 text-sm leading-6 app-muted-text">
                O valor de <strong className="text-white">{totalAmount}</strong>{" "}
                será debitado da conta escolhida. Essa ação marcará a fatura
                como paga e atualizará o saldo da conta.
              </p>

              <form action={payCardInvoiceAction} className="mt-6 grid gap-4">
                <input type="hidden" name="creditCardId" value={creditCardId} />
                <input type="hidden" name="month" value={month} />
                <input type="hidden" name="year" value={year} />

                <div>
                  <label className="mb-2 flex items-center gap-2 text-sm font-bold text-white">
                    <Wallet className="h-4 w-4" />
                    Conta para pagamento
                  </label>

                  <select required name="accountId" className="finance-input">
                    <option value="">Selecione uma conta</option>

                    {accounts.map((account) => (
                      <option key={account.id} value={account.id}>
                        {account.name} • Saldo atual: {account.currentBalance}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="app-button-secondary flex-1"
                  >
                    Cancelar
                  </button>

                  <button
                    type="submit"
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl border border-purple-500/30 bg-purple-500 px-4 py-3 text-sm font-black text-white shadow-[0_0_28px_rgba(168,85,247,0.35)] transition hover:bg-purple-600"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    Confirmar pagamento
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body,
        )
      : null;

  return (
    <>
      <section className="app-card p-6">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h3 className="text-xl font-black tracking-[-0.03em] text-white">
              Pagamento da fatura
            </h3>

            <p className="mt-1 text-sm app-faint-text">
              Escolha uma conta para debitar o valor da fatura selecionada.
            </p>
          </div>

          <span
            className={
              invoiceStatusLabel === "Paga"
                ? "finance-badge finance-badge-income"
                : "finance-badge finance-badge-card"
            }
          >
            {invoiceStatusLabel}
          </span>
        </div>

        {!selectedCardIsValid && (
          <div className="mt-5 rounded-3xl border border-amber-500/20 bg-amber-500/10 p-4">
            <p className="text-sm font-bold text-amber-400">
              Selecione um cartão específico para pagar a fatura.
            </p>
          </div>
        )}

        {selectedCardIsValid && !canPayInvoice && (
          <div className="mt-5 rounded-3xl border border-white/10 bg-black/25 p-4">
            <p className="text-sm app-muted-text">
              Esta fatura não possui compras pendentes para pagamento ou já foi
              paga.
            </p>
          </div>
        )}

        {selectedCardIsValid && canPayInvoice && (
          <div className="mt-5 flex flex-col justify-between gap-4 rounded-3xl border border-white/10 bg-black/25 p-4 md:flex-row md:items-center">
            <div>
              <p className="text-sm app-faint-text">
                Valor a debitar da conta
              </p>

              <strong className="mt-1 block text-2xl font-black text-white">
                {totalAmount}
              </strong>
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(true)}
              className="app-button-primary"
            >
              <CheckCircle2 className="h-4 w-4" />
              Pagar fatura
            </button>
          </div>
        )}
      </section>

      {modal}
    </>
  );
}