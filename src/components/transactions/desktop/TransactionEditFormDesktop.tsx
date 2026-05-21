"use client";

import { type FormEvent, useMemo, useRef, useState } from "react";
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

type TransactionEditFormDesktopProps = {
  transaction: TransactionEditData;
  accounts: AccountOption[];
  categories: CategoryOption[];
  creditCards: CreditCardOption[];
  defaultType?: TransactionType;
};

export function TransactionEditFormDesktop({
  transaction,
  accounts,
  categories,
  creditCards,
  defaultType,
}: TransactionEditFormDesktopProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const editModeInputRef = useRef<HTMLInputElement>(null);
  const confirmedSubmitRef = useRef(false);
  const [showSeriesDialog, setShowSeriesDialog] = useState(false);
  const [seriesTotalInstallments, setSeriesTotalInstallments] = useState(
    String(transaction.series?.totalInstallments ?? 1),
  );
  const [transactionType, setTransactionType] = useState<TransactionType>(
    defaultType ?? transaction.type,
  );

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(
    transactionType === "INCOME" && transaction.paymentMethod === "CREDIT_CARD"
      ? "PIX"
      : transaction.paymentMethod,
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
  const parsedSeriesTotalInstallments = Number(seriesTotalInstallments);
  const seriesTotalPreview =
    transaction.series && Number.isFinite(parsedSeriesTotalInstallments)
      ? parsedSeriesTotalInstallments
      : transaction.series?.totalInstallments;

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

  function handleTypeChange(type: TransactionType) {
    setTransactionType(type);

    if (type === "INCOME" && paymentMethod === "CREDIT_CARD") {
      setPaymentMethod("PIX");
    }
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

  return (
    <form
      ref={formRef}
      action={updateTransactionAction}
      onSubmit={handleSubmit}
      className="grid gap-6"
    >
      <input type="hidden" name="transactionId" value={transaction.id} />
      <input type="hidden" name="type" value={transactionType} />
      <input
        ref={editModeInputRef}
        type="hidden"
        name="editMode"
        value="single"
      />
      <input
        type="hidden"
        name="seriesTotalInstallments"
        value={seriesTotalInstallments}
      />

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
                    ? "rounded-3xl border border-red-500/30 bg-red-500/10 p-5 text-left"
                    : "rounded-3xl border border-white/10 bg-black/25 p-5 text-left transition hover:border-red-500/20 hover:bg-red-500/5"
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
                    ? "rounded-3xl border border-emerald-500/30 bg-emerald-500/10 p-5 text-left"
                    : "rounded-3xl border border-white/10 bg-black/25 p-5 text-left transition hover:border-emerald-500/20 hover:bg-emerald-500/5"
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
                  Data de vencimento
                </label>

                <input
                  type="date"
                  name="dueDate"
                  defaultValue={transaction.dueDate}
                  className="finance-input"
                />
              </div>
            )}

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

      {showSeriesDialog && transaction.series ? (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-[2rem] border border-white/10 bg-[#050816] p-5 shadow-2xl shadow-black/60">
            <p className="text-sm font-bold text-cyan-200">
              Parcela {transaction.series.currentInstallment}/
              {transaction.series.totalInstallments}
            </p>

            <h3 className="mt-2 text-xl font-black tracking-[-0.03em] text-white">
              Como deseja editar?
            </h3>

            <p className="mt-2 text-sm leading-6 app-muted-text">
              Este lançamento faz parte de uma série. Você pode alterar apenas
              esta parcela ou aplicar nos próximos lançamentos da mesma série.
            </p>

            <div className="mt-5 grid gap-3">
              <div className="rounded-3xl border border-white/10 bg-black/25 p-4">
                <label className="mb-2 block text-sm font-bold text-white">
                  Quantidade total (somente este)
                </label>

                <input
                  type="number"
                  value={transaction.series.totalInstallments}
                  disabled
                  className="finance-input opacity-60"
                />

                <label className="mb-2 mt-4 block text-sm font-bold text-white">
                  Quantidade total (este e próximos)
                </label>

                <input
                  type="number"
                  min={transaction.series.currentInstallment}
                  value={seriesTotalInstallments}
                  onChange={(event) =>
                    setSeriesTotalInstallments(event.target.value)
                  }
                  className="finance-input"
                />

                <p className="mt-3 text-xs leading-5 app-muted-text">
                  Somente este mantém a quantidade bloqueada. Em este e
                  próximos, a série passará de{" "}
                  {transaction.series.totalInstallments} para{" "}
                  {seriesTotalPreview} parcelas.
                </p>

                {seriesTotalPreview &&
                seriesTotalPreview > transaction.series.totalInstallments ? (
                  <p className="mt-2 text-xs font-bold text-emerald-300">
                    Novas parcelas serão criadas como pendentes.
                  </p>
                ) : null}

                {seriesTotalPreview &&
                seriesTotalPreview < transaction.series.totalInstallments ? (
                  <p className="mt-2 text-xs font-bold text-amber-300">
                    Parcelas futuras excedentes serão canceladas se estiverem
                    pendentes.
                  </p>
                ) : null}
              </div>

              <button
                type="button"
                onClick={() => submitWithEditMode("single")}
                className="app-button-primary w-full"
              >
                Somente este
              </button>

              <button
                type="button"
                onClick={() => submitWithEditMode("future")}
                className="app-button-secondary w-full"
              >
                Este e próximos
              </button>

              <button
                type="button"
                onClick={() => setShowSeriesDialog(false)}
                className="rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm font-extrabold text-white/60 transition hover:bg-white/5 hover:text-white"
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
