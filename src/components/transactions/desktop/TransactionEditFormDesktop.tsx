"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Repeat, Save } from "lucide-react";
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
  series: {
    repetitionId: string;
    repetitionType?: string;
    currentInstallment: number;
    totalInstallments: number;
    amountMode?: string;
  } | null;
};

type TransactionEditFormDesktopProps = {
  transaction: TransactionEditData;
  accounts: AccountOption[];
  categories: CategoryOption[];
  creditCards: CreditCardOption[];
  defaultType?: TransactionType;
  editScope: EditScope;
  errorMessage?: string | null;
};

function getAmountModeLabel(amountMode?: string) {
  return amountMode === "TOTAL" ? "valor total dividido" : "valor por parcela";
}

export function TransactionEditFormDesktop({
  transaction,
  accounts,
  categories,
  creditCards,
  defaultType,
  editScope,
  errorMessage,
}: TransactionEditFormDesktopProps) {
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
  const canEditSeriesQuantity =
    Boolean(transaction.series) && editScope === "THIS_AND_NEXT";
  const editModeValue = editScope === "THIS_AND_NEXT" ? "future" : "single";
  const parsedSeriesTotalInstallments = Number(seriesTotalInstallments);
  const seriesTotalPreview =
    transaction.series && Number.isFinite(parsedSeriesTotalInstallments)
      ? parsedSeriesTotalInstallments
      : transaction.series?.totalInstallments;

  const filteredCategories = useMemo(() => {
    return categories.filter((category) => category.type === transactionType);
  }, [categories, transactionType]);

  const currentCategoryIsCompatible = filteredCategories.some(
    (category) => category.id === transaction.categoryId,
  );

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
        { value: "DEBIT_CARD", label: "Cartao de debito" },
        { value: "CREDIT_CARD", label: "Cartao de credito" },
        { value: "BANK_TRANSFER", label: "Transferencia" },
        { value: "BOLETO", label: "Boleto" },
        { value: "OTHER", label: "Outro" },
      ];

  function handleTypeChange(type: TransactionType) {
    setTransactionType(type);

    if (type === "INCOME" && paymentMethod === "CREDIT_CARD") {
      setPaymentMethod("PIX");
    }
  }

  return (
    <form action={updateTransactionAction} className="grid gap-6">
      <input type="hidden" name="transactionId" value={transaction.id} />
      <input type="hidden" name="type" value={transactionType} />
      <input type="hidden" name="editMode" value={editModeValue} />
      <input
        type="hidden"
        name="seriesTotalInstallments"
        value={seriesTotalInstallments}
      />

      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <Link
            href="/lancamentos"
            className="inline-flex items-center gap-2 text-sm font-bold app-faint-text transition hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar para lancamentos
          </Link>

          <h2 className="mt-3 text-3xl font-black tracking-[-0.04em] text-white">
            Editar lancamento
          </h2>

          <p className="mt-2 text-sm app-muted-text">
            {isIncome
              ? "Ajuste os dados dessa entrada recebida."
              : "Ajuste os dados dessa saida, conta ou pagamento."}
          </p>

          {transaction.series ? (
            <p className="mt-2 text-xs font-bold text-cyan-200">
              {editScope === "THIS_AND_NEXT"
                ? "Editando este e os proximos lancamentos"
                : "Editando somente este lancamento"}
            </p>
          ) : null}
        </div>

        <button type="submit" className="app-button-primary">
          <Save className="h-4 w-4" />
          Salvar alteracoes
        </button>
      </div>

      {errorMessage ? (
        <div className="rounded-3xl border border-red-500/20 bg-red-500/10 p-4 text-sm font-bold text-red-300">
          {errorMessage}
        </div>
      ) : null}

      <section className="app-card p-6">
        <div className="grid gap-6">
          <div>
            <label className="mb-3 block text-sm font-bold text-white">
              Tipo de lancamento
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
                  Saida
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
                  Salario, renda extra, recebimentos e ganhos.
                </span>
              </button>
            </div>
          </div>

          {transaction.series ? (
            <section className="rounded-[1.75rem] border border-white/10 bg-black/20 p-5">
              <div className="flex items-start gap-3">
                <div className="app-icon-box h-11 w-11">
                  <Repeat className="h-5 w-5" />
                </div>

                <div>
                  <h3 className="text-lg font-black tracking-[-0.03em] text-white">
                    Repeticao da serie
                  </h3>
                  <p className="mt-1 text-sm app-faint-text">
                    Parcela {transaction.series.currentInstallment}/
                    {transaction.series.totalInstallments} ·{" "}
                    {getAmountModeLabel(transaction.series.amountMode)}
                  </p>
                </div>
              </div>

              <div className="mt-5 grid gap-5 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-bold text-white">
                    Quantidade total
                  </label>
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

                  {!canEditSeriesQuantity ? (
                    <p className="mt-2 text-xs text-amber-300">
                      Para alterar a quantidade, edite este e os proximos.
                    </p>
                  ) : null}
                </div>

                <div className="rounded-3xl border border-white/10 bg-white/5 p-4 text-sm leading-6 app-muted-text">
                  <p>
                    A serie passara de {transaction.series.totalInstallments}{" "}
                    para {seriesTotalPreview} parcelas.
                  </p>

                  {seriesTotalPreview &&
                  seriesTotalPreview > transaction.series.totalInstallments ? (
                    <p className="mt-2 font-bold text-emerald-300">
                      Novas parcelas serao criadas como pendentes.
                    </p>
                  ) : null}

                  {seriesTotalPreview &&
                  seriesTotalPreview < transaction.series.totalInstallments ? (
                    <p className="mt-2 font-bold text-amber-300">
                      Parcelas futuras excedentes serao canceladas se estiverem
                      pendentes.
                    </p>
                  ) : null}
                </div>
              </div>
            </section>
          ) : null}

          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-bold text-white">
                Descricao
              </label>
              <input
                required
                name="description"
                defaultValue={transaction.description}
                placeholder={isIncome ? "Ex: Salario" : "Ex: Mercado"}
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
                {isIncome ? "Data de recebimento" : "Data do lancamento"}
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
                  Cartao de credito
                </label>
                <select
                  required
                  name="creditCardId"
                  defaultValue={transaction.creditCardId}
                  className="finance-input"
                >
                  <option value="">Selecione um cartao</option>
                  {creditCards.map((card) => (
                    <option key={card.id} value={card.id}>
                      {card.name} · {card.bank}
                    </option>
                  ))}
                </select>
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
              Observacoes
            </label>
            <textarea
              name="notes"
              rows={4}
              defaultValue={transaction.notes}
              placeholder="Informacoes adicionais..."
              className="finance-input resize-none"
            />
          </div>
        </div>
      </section>
    </form>
  );
}
