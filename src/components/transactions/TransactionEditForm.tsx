"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";
import { updateTransactionAction } from "@/actions/transactions-actions";

type AccountOption = {
  id: string;
  name: string;
  type: string;
};

type CategoryOption = {
  id: string;
  name: string;
  type: "INCOME" | "EXPENSE";
};

type CreditCardOption = {
  id: string;
  name: string;
  bank: string;
  closingDay: number;
  dueDay: number;
};

type PaymentMethod =
  | "PIX"
  | "CASH"
  | "DEBIT_CARD"
  | "CREDIT_CARD"
  | "BANK_TRANSFER"
  | "BOLETO"
  | "OTHER";

type TransactionEditData = {
  id: string;
  familyId: string;
  accountId: string;
  creditCardId: string;
  categoryId: string;
  type: "INCOME" | "EXPENSE";
  description: string;
  amount: string;
  transactionDate: string;
  status: "PAID" | "PENDING" | "OVERDUE" | "CANCELED";
  paymentMethod: PaymentMethod;
  notes: string;
};

type TransactionEditFormProps = {
  transaction: TransactionEditData;
  accounts: AccountOption[];
  categories: CategoryOption[];
  creditCards: CreditCardOption[];
};

export function TransactionEditForm({
  transaction,
  accounts,
  categories,
  creditCards,
}: TransactionEditFormProps) {
  const [transactionType, setTransactionType] = useState<"INCOME" | "EXPENSE">(
    transaction.type,
  );
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(
    transaction.paymentMethod,
  );

  const isIncome = transactionType === "INCOME";
  const isExpense = transactionType === "EXPENSE";
  const isCreditCardPayment = isExpense && paymentMethod === "CREDIT_CARD";

  const filteredCategories = useMemo(() => {
    return categories.filter((category) => category.type === transactionType);
  }, [categories, transactionType]);

  const currentCategoryIsCompatible = filteredCategories.some(
    (category) => category.id === transaction.categoryId,
  );

  const paymentOptions = isIncome
    ? [
        { value: "PIX", label: "Pix" },
        { value: "CASH", label: "Dinheiro" },
        { value: "BANK_TRANSFER", label: "Transferência" },
        { value: "OTHER", label: "Outro" },
      ]
    : [
        { value: "PIX", label: "Pix" },
        { value: "CASH", label: "Dinheiro" },
        { value: "DEBIT_CARD", label: "Cartão de débito" },
        { value: "CREDIT_CARD", label: "Cartão de crédito" },
        { value: "BANK_TRANSFER", label: "Transferência" },
        { value: "BOLETO", label: "Boleto" },
        { value: "OTHER", label: "Outro" },
      ];

  function handleTypeChange(type: "INCOME" | "EXPENSE") {
    setTransactionType(type);

    if (type === "INCOME" && paymentMethod === "CREDIT_CARD") {
      setPaymentMethod("PIX");
    }
  }

  return (
    <form action={updateTransactionAction} className="grid gap-6">
      <input type="hidden" name="transactionId" value={transaction.id} />
      <input type="hidden" name="type" value={transactionType} />

      {isIncome && <input type="hidden" name="status" value="PAID" />}

      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <Link
            href="/lancamentos"
            className="inline-flex items-center gap-2 text-sm font-bold app-faint-text transition hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar para lançamentos
          </Link>

          <h2 className="mt-3 text-3xl font-black tracking-[-0.04em] text-white">
            Editar lançamento
          </h2>

          <p className="mt-2 text-sm app-muted-text">
            {isIncome
              ? "Ajuste os dados dessa entrada recebida."
              : "Ajuste os dados dessa saída, conta ou pagamento."}
          </p>
        </div>

        <button type="submit" className="app-button-primary">
          <Save className="h-4 w-4" />
          Salvar alterações
        </button>
      </div>

      <section className="app-card p-6">
        <div className="grid gap-6">
          <div>
            <label className="mb-3 block text-sm font-bold text-white">
              Tipo de lançamento
            </label>

            <div className="grid gap-3 md:grid-cols-2">
              <button
                type="button"
                onClick={() => handleTypeChange("EXPENSE")}
                className={
                  isExpense
                    ? "cursor-pointer rounded-3xl border border-red-500/30 bg-red-500/10 p-5 text-left"
                    : "cursor-pointer rounded-3xl border border-white/10 bg-black/25 p-5 text-left transition hover:border-red-500/20 hover:bg-red-500/5"
                }
              >
                <span className="block text-sm font-black finance-expense">
                  Saída
                </span>

                <span className="mt-1 block text-xs app-faint-text">
                  Despesas, compras, contas e pagamentos.
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleTypeChange("INCOME")}
                className={
                  isIncome
                    ? "cursor-pointer rounded-3xl border border-emerald-500/30 bg-emerald-500/10 p-5 text-left"
                    : "cursor-pointer rounded-3xl border border-white/10 bg-black/25 p-5 text-left transition hover:border-emerald-500/20 hover:bg-emerald-500/5"
                }
              >
                <span className="block text-sm font-black finance-income">
                  Entrada
                </span>

                <span className="mt-1 block text-xs app-faint-text">
                  Salário, renda extra, recebimentos e ganhos.
                </span>
              </button>
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-bold text-white">
                Descrição
              </label>

              <input
                required
                name="description"
                defaultValue={transaction.description}
                placeholder={
                  isIncome
                    ? "Ex: Salário, freelance, renda extra..."
                    : "Ex: Mercado, internet, combustível..."
                }
                className="finance-input"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-white">
                Valor
              </label>

              <input
                required
                name="amount"
                defaultValue={transaction.amount}
                placeholder="Ex: 150,00"
                inputMode="decimal"
                className="finance-input"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-white">
                {isIncome ? "Data de recebimento" : "Data do lançamento"}
              </label>

              <input
                required
                type="date"
                name="transactionDate"
                defaultValue={transaction.transactionDate}
                className="finance-input"
              />
            </div>

            {isExpense && (
              <div>
                <label className="mb-2 block text-sm font-bold text-white">
                  Status
                </label>

                <select
                  name="status"
                  defaultValue={transaction.status}
                  className="finance-input"
                >
                  <option value="PAID">Pago</option>
                  <option value="PENDING">Pendente</option>
                  <option value="OVERDUE">Atrasado</option>
                  <option value="CANCELED">Cancelado</option>
                </select>
              </div>
            )}

            {!isCreditCardPayment && (
              <div>
                <label className="mb-2 block text-sm font-bold text-white">
                  {isIncome ? "Conta de destino" : "Conta"}
                </label>

                <select
                  name="accountId"
                  defaultValue={transaction.accountId}
                  className="finance-input"
                >
                  <option value="">
                    {isIncome ? "Selecionar conta de destino" : "Sem conta"}
                  </option>

                  {accounts.map((account) => (
                    <option key={account.id} value={account.id}>
                      {account.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {isCreditCardPayment && (
              <div>
                <label className="mb-2 block text-sm font-bold text-white">
                  Cartão de crédito
                </label>

                <select
                  required
                  name="creditCardId"
                  defaultValue={transaction.creditCardId}
                  className="finance-input"
                >
                  <option value="">Selecione um cartão</option>

                  {creditCards.map((card) => (
                    <option key={card.id} value={card.id}>
                      {card.name} • {card.bank}
                    </option>
                  ))}
                </select>

                <p className="mt-2 text-xs text-purple-400">
                  Compras no crédito não alteram o saldo da conta agora. Elas
                  serão usadas para controle de fatura.
                </p>
              </div>
            )}

            <div>
              <label className="mb-2 block text-sm font-bold text-white">
                Categoria
              </label>

              <select
                name="categoryId"
                defaultValue={
                  currentCategoryIsCompatible ? transaction.categoryId : ""
                }
                className="finance-input"
              >
                <option value="">Sem categoria</option>

                {filteredCategories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>

              {!currentCategoryIsCompatible && transaction.categoryId && (
                <p className="mt-2 text-xs text-amber-400">
                  A categoria anterior pertence a outro tipo de lançamento.
                  Selecione uma nova categoria antes de salvar.
                </p>
              )}
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-white">
                {isIncome ? "Forma de recebimento" : "Forma de pagamento"}
              </label>

              <select
                name="paymentMethod"
                value={paymentMethod}
                onChange={(event) =>
                  setPaymentMethod(event.target.value as PaymentMethod)
                }
                className="finance-input"
              >
                {paymentOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-bold text-white">
              Observações
            </label>

            <textarea
              name="notes"
              rows={4}
              defaultValue={transaction.notes}
              placeholder={
                isIncome
                  ? "Informações adicionais sobre essa entrada..."
                  : "Informações adicionais sobre essa saída..."
              }
              className="finance-input resize-none"
            />
          </div>
        </div>
      </section>
    </form>
  );
}