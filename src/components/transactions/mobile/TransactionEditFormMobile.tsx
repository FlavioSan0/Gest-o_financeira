"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowDownCircle,
  ArrowLeft,
  ArrowUpCircle,
  Repeat,
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
type EditScope = "SINGLE" | "THIS_AND_NEXT";

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
  responsible?: string;
  series: {
    repetitionId: string;
    repetitionType?: string;
    currentInstallment: number;
    totalInstallments: number;
    amountMode?: string;
  } | null;
};

type TransactionEditFormMobileProps = {
  transaction: TransactionEditData;
  accounts: AccountOption[];
  categories: CategoryOption[];
  creditCards: CreditCardOption[];
  defaultType?: TransactionType;
  editScope: EditScope;
  errorMessage?: string | null;
};

function getAmountModeLabel(amountMode?: string) {
  return amountMode === "TOTAL" ? "total" : "por parcela";
}

export function TransactionEditFormMobile({
  transaction,
  accounts,
  categories,
  creditCards,
  defaultType,
  editScope,
  errorMessage,
}: TransactionEditFormMobileProps) {
  const [seriesTotalInstallments, setSeriesTotalInstallments] = useState(
    String(transaction.series?.totalInstallments ?? 1),
  );
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
  const canEditSeriesQuantity =
    Boolean(transaction.series) && editScope === "THIS_AND_NEXT";
  const editModeValue = editScope === "THIS_AND_NEXT" ? "future" : "single";
  const parsedSeriesTotalInstallments = Number(seriesTotalInstallments);
  const seriesTotalPreview =
    transaction.series && Number.isFinite(parsedSeriesTotalInstallments)
      ? parsedSeriesTotalInstallments
      : transaction.series?.totalInstallments;

  const paymentOptions: { value: PaymentMethod; label: string }[] = isIncome
    ? [
        { value: "PIX", label: "Pix" },
        { value: "CASH", label: "Dinheiro" },
        { value: "BANK_TRANSFER", label: "Transferencia" },
        { value: "OTHER", label: "Outro" },
      ]
    : [
        { value: "PIX", label: "Pix" },
        { value: "CASH", label: "Dinheiro" },
        { value: "DEBIT_CARD", label: "Debito" },
        { value: "CREDIT_CARD", label: "Credito" },
        { value: "BANK_TRANSFER", label: "Transferencia" },
        { value: "BOLETO", label: "Boleto" },
        { value: "OTHER", label: "Outro" },
      ];

  return (
    <form action={updateTransactionAction} className="mobile-transaction-form">
      <input type="hidden" name="transactionId" value={transaction.id} />
      <input type="hidden" name="type" value={transactionType} />
      <input type="hidden" name="editMode" value={editModeValue} />
      <input
        type="hidden"
        name="seriesTotalInstallments"
        value={seriesTotalInstallments}
      />

      <header className="mobile-form-header">
        <Link href="/lancamentos" className="mobile-form-back">
          <ArrowLeft className="h-4 w-4" />
          Lancamentos
        </Link>

        <h2>Editar</h2>
        <p>
          {transaction.series
            ? editScope === "THIS_AND_NEXT"
              ? "Este e os proximos."
              : "Somente este lancamento."
            : "Lancamento simples."}
        </p>
      </header>

      {errorMessage ? (
        <div className="rounded-3xl border border-red-500/20 bg-red-500/10 p-4 text-sm font-bold text-red-300">
          {errorMessage}
        </div>
      ) : null}

      <section className="mobile-form-card">
        <div className="mobile-form-compact-grid">
          <div className="mobile-form-group mobile-form-span-2">
            <label className="mobile-form-label">Descricao</label>
            <input
              required
              name="description"
              defaultValue={transaction.description}
              placeholder={isIncome ? "Salario" : "Mercado"}
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
        </div>

        <div className="mobile-type-switch" role="group" aria-label="Tipo">
          <Link
            href={`/lancamentos/${transaction.id}/editar?scope=${editScope}&type=EXPENSE`}
            prefetch={false}
            scroll={false}
            className={
              isExpense
                ? "mobile-type-switch__option mobile-type-switch__option--expense mobile-type-switch__option--active"
                : "mobile-type-switch__option mobile-type-switch__option--expense"
            }
          >
            <ArrowDownCircle className="h-4 w-4" />
            <span>Saida</span>
          </Link>

          <Link
            href={`/lancamentos/${transaction.id}/editar?scope=${editScope}&type=INCOME`}
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
      </section>

      <section className="mobile-form-card">
        <div className="mobile-form-compact-grid">
          <div className="mobile-form-group">
            <label className="mobile-form-label">
              {isIncome ? "Recebido em" : "Data"}
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
              <label className="mobile-form-label">Vencimento</label>
              <input
                type="date"
                name="dueDate"
                defaultValue={transaction.dueDate}
                className="finance-input"
              />
            </div>
          )}

          <div className="mobile-form-group mobile-form-span-2">
            <label className="mobile-form-label">
              {isIncome ? "Recebimento" : "Pagamento"}
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
      </section>

      <section className="mobile-form-card">
        <div className="mobile-form-compact-grid">
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
          </div>

          {!isCreditCardPayment ? (
            <div className="mobile-form-group">
              <label className="mobile-form-label">
                {isIncome ? "Destino" : "Conta"}
              </label>
              <select
                name="accountId"
                defaultValue={transaction.accountId}
                className="finance-input"
              >
                <option value="">{isIncome ? "Selecionar" : "Sem conta"}</option>
                {accounts.map((account) => (
                  <option key={account.id} value={account.id}>
                    {account.name}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="mobile-form-group">
              <label className="mobile-form-label">Cartao</label>
              <select
                required
                name="creditCardId"
                defaultValue={transaction.creditCardId}
                className="finance-input"
              >
                <option value="">Selecione</option>
                {creditCards.map((card) => (
                  <option key={card.id} value={card.id}>
                    {card.name} - {card.bank}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="mobile-form-readonly mobile-form-span-2">
            <span>Responsavel</span>
            <strong>{transaction.responsible ?? "Nao informado"}</strong>
          </div>
        </div>
      </section>

      {transaction.series ? (
        <section className="mobile-form-card mobile-form-repeat-card">
          <div className="mobile-repeat-title">
            <Repeat className="h-4 w-4" />
            <span>Serie</span>
          </div>

          <div className="mobile-form-compact-grid">
            <div className="mobile-form-group">
              <label className="mobile-form-label">Parcela</label>
              <div className="mobile-series-preview">
                <span>
                  {transaction.series.currentInstallment}/
                  {transaction.series.totalInstallments}
                </span>
                <strong>{getAmountModeLabel(transaction.series.amountMode)}</strong>
              </div>
            </div>

            <div className="mobile-form-group">
              <label className="mobile-form-label">Qtd. total</label>
              <input
                type="number"
                min={transaction.series.currentInstallment}
                value={seriesTotalInstallments}
                disabled={!canEditSeriesQuantity}
                onChange={(event) =>
                  setSeriesTotalInstallments(event.target.value)
                }
                className={
                  canEditSeriesQuantity
                    ? "finance-input"
                    : "finance-input opacity-60"
                }
              />
            </div>

            <div className="mobile-series-preview mobile-form-span-2">
              <span>
                {canEditSeriesQuantity
                  ? "Este e os proximos"
                  : "Somente este"}
              </span>
              <strong>Total: {seriesTotalPreview}</strong>
            </div>
          </div>
        </section>
      ) : null}

      <section className="mobile-form-card">
        <label className="mobile-form-label">Observacoes</label>
        <textarea
          name="notes"
          rows={3}
          defaultValue={transaction.notes}
          placeholder="Opcional"
          className="finance-input resize-none"
        />
      </section>

      <button type="submit" className="mobile-form-submit">
        <Save className="h-4 w-4" />
        Salvar alteracoes
      </button>
    </form>
  );
}
