"use client";

import { type FormEvent, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowDownCircle,
  ArrowLeft,
  ArrowUpCircle,
  Save,
} from "lucide-react";
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

type TransactionType = "INCOME" | "EXPENSE";

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
  type: TransactionType;
  description: string;
  amount: string;
  transactionDate: string;
  dueDate: string;
  status: "PAID" | "PENDING" | "OVERDUE" | "CANCELED";
  paymentMethod: PaymentMethod;
  notes: string;
  series: {
    repetitionId: string;
    currentInstallment: number;
    totalInstallments: number;
  } | null;
};

type TransactionEditFormMobileProps = {
  transaction: TransactionEditData;
  accounts: AccountOption[];
  categories: CategoryOption[];
  creditCards: CreditCardOption[];
  defaultType?: TransactionType;
};

export function TransactionEditFormMobile({
  transaction,
  accounts,
  categories,
  creditCards,
  defaultType,
}: TransactionEditFormMobileProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const editModeInputRef = useRef<HTMLInputElement>(null);
  const confirmedSubmitRef = useRef(false);
  const [showSeriesDialog, setShowSeriesDialog] = useState(false);
  const transactionType = defaultType ?? transaction.type;
  const isIncome = transactionType === "INCOME";
  const isExpense = transactionType === "EXPENSE";

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(
    isIncome && transaction.paymentMethod === "CREDIT_CARD"
      ? "PIX"
      : transaction.paymentMethod,
  );

  const filteredCategories = categories.filter(
    (category) => category.type === transactionType,
  );

  const currentCategoryIsCompatible = filteredCategories.some(
    (category) => category.id === transaction.categoryId,
  );

  const isCreditCardPayment = isExpense && paymentMethod === "CREDIT_CARD";

  function handlePaymentMethodChange(method: PaymentMethod) {
    setPaymentMethod(method);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    if (transaction.series && !confirmedSubmitRef.current) {
      event.preventDefault();
      setShowSeriesDialog(true);
      return;
    }

    confirmedSubmitRef.current = false;
  }

  function submitWithEditMode(mode: "single" | "future") {
    if (editModeInputRef.current) {
      editModeInputRef.current.value = mode;
    }

    confirmedSubmitRef.current = true;
    setShowSeriesDialog(false);
    formRef.current?.requestSubmit();
  }

  const paymentOptions: { value: PaymentMethod; label: string }[] = isIncome
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

  return (
    <form
      ref={formRef}
      action={updateTransactionAction}
      onSubmit={handleSubmit}
      className="mobile-transaction-form"
    >
      <input type="hidden" name="transactionId" value={transaction.id} />
      <input type="hidden" name="type" value={transactionType} />
      <input
        ref={editModeInputRef}
        type="hidden"
        name="editMode"
        value="single"
      />

      {isIncome && <input type="hidden" name="status" value="PAID" />}

      <header className="mobile-form-header">
        <Link href="/lancamentos" className="mobile-form-back">
          <ArrowLeft className="h-4 w-4" />
          Lançamentos
        </Link>

        <h2>Editar lançamento</h2>

        <p>
          {isIncome
            ? "Ajuste uma entrada recebida."
            : "Ajuste uma saída, compra, conta ou pagamento."}
        </p>
      </header>

      <section className="mobile-form-card">
        <label className="mobile-form-label">Tipo de lançamento</label>

        <div
          className="mobile-type-switch"
          role="group"
          aria-label="Tipo de lançamento"
        >
          <Link
            href={`/lancamentos/${transaction.id}/editar?type=EXPENSE`}
            prefetch={false}
            scroll={false}
            className={
              isExpense
                ? "mobile-type-switch__option mobile-type-switch__option--expense mobile-type-switch__option--active"
                : "mobile-type-switch__option mobile-type-switch__option--expense"
            }
          >
            <ArrowDownCircle className="h-4 w-4" />
            <span>Saída</span>
          </Link>

          <Link
            href={`/lancamentos/${transaction.id}/editar?type=INCOME`}
            prefetch={false}
            scroll={false}
            className={
              isIncome
                ? "mobile-type-switch__option mobile-type-switch__option--income mobile-type-switch__option--active"
                : "mobile-type-switch__option mobile-type-switch__option--income"
            }
          >
            <ArrowUpCircle className="h-4 w-4" />
            <span>Entrada</span>
          </Link>
        </div>

        <p
          className={
            isIncome
              ? "mobile-form-helper finance-income"
              : "mobile-form-helper finance-expense"
          }
        >
          {isIncome
            ? "Entrada: salário, renda extra e recebimentos."
            : "Saída: despesas, compras, contas e pagamentos."}
        </p>
      </section>

      <section className="mobile-form-card">
        <div className="mobile-form-group">
          <label className="mobile-form-label">Descrição</label>

          <input
            required
            name="description"
            defaultValue={transaction.description}
            placeholder={isIncome ? "Ex: Salário" : "Ex: Mercado"}
            className="finance-input"
          />
        </div>

        <div className="mobile-form-group">
          <label className="mobile-form-label">Valor</label>

          <input
            required
            name="amount"
            defaultValue={transaction.amount}
            placeholder="R$ 0,00"
            inputMode="decimal"
            className="finance-input mobile-form-value-input"
          />
        </div>

        <div className="mobile-form-group">
          <label className="mobile-form-label">
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
          <div className="mobile-form-group">
            <label className="mobile-form-label">Data de vencimento</label>

            <input
              type="date"
              name="dueDate"
              defaultValue={transaction.dueDate}
              className="finance-input"
            />
          </div>
        )}

        {isExpense && (
          <div className="mobile-form-group">
            <label className="mobile-form-label">Status</label>

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
      </section>

      <section className="mobile-form-card">
        {!isCreditCardPayment && (
          <div className="mobile-form-group">
            <label className="mobile-form-label">
              {isIncome ? "Conta de destino" : "Conta"}
            </label>

            <select
              name="accountId"
              defaultValue={transaction.accountId}
              className="finance-input"
            >
              <option value="">{isIncome ? "Selecionar conta" : "Sem conta"}</option>

              {accounts.map((account) => (
                <option key={account.id} value={account.id}>
                  {account.name}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="mobile-form-group">
          <label className="mobile-form-label">Categoria</label>

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
            <p className="mobile-form-helper text-amber-400">
              A categoria anterior pertence a outro tipo de lançamento.
              Selecione uma nova categoria antes de salvar.
            </p>
          )}
        </div>

        <div className="mobile-form-group">
          <label className="mobile-form-label">
            {isIncome ? "Recebimento" : "Pagamento"}
          </label>

          <select
            name="paymentMethod"
            value={paymentMethod}
            onChange={(event) =>
              handlePaymentMethodChange(event.target.value as PaymentMethod)
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
      </section>

      {isCreditCardPayment && (
        <section className="mobile-form-card">
          <div className="mobile-form-group">
            <label className="mobile-form-label">Cartão de crédito</label>

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
          </div>

          <p className="mobile-form-helper">
            Compras no crédito não alteram o saldo da conta agora. Elas serão
            usadas para controle de fatura.
          </p>
        </section>
      )}

      <section className="mobile-form-card">
        <label className="mobile-form-label">Observações</label>

        <textarea
          name="notes"
          rows={4}
          defaultValue={transaction.notes}
          placeholder="Informações adicionais..."
          className="finance-input resize-none"
        />
      </section>

      <button type="submit" className="mobile-form-submit">
        <Save className="h-4 w-4" />
        Salvar alterações
      </button>
      {showSeriesDialog && transaction.series ? (
        <div className="fixed inset-0 z-[120] flex items-end bg-black/70 px-4 pb-5 backdrop-blur-sm sm:items-center sm:justify-center sm:pb-0">
          <div className="w-full rounded-[2rem] border border-white/10 bg-[#050816] p-5 shadow-2xl shadow-black/60 sm:max-w-md">
            <p className="text-sm font-bold text-cyan-200">
              Parcela {transaction.series.currentInstallment}/
              {transaction.series.totalInstallments}
            </p>

            <h3 className="mt-2 text-xl font-black tracking-[-0.03em] text-white">
              Como deseja editar?
            </h3>

            <p className="mt-2 text-sm leading-6 app-muted-text">
              Este lançamento faz parte de uma série. Escolha se a mudança vale
              só para esta parcela ou também para as próximas.
            </p>

            <div className="mt-5 grid gap-3">
              <button
                type="button"
                onClick={() => submitWithEditMode("single")}
                className="mobile-form-submit"
              >
                Somente este
              </button>

              <button
                type="button"
                onClick={() => submitWithEditMode("future")}
                className="rounded-2xl border border-white/10 bg-white/8 px-4 py-3 text-sm font-extrabold text-white transition hover:bg-white hover:text-slate-950"
              >
                Este e próximos
              </button>

              <button
                type="button"
                onClick={() => setShowSeriesDialog(false)}
                className="rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm font-extrabold text-white/60"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </form>
  );
}
