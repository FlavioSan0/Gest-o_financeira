"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowDownCircle,
  ArrowLeft,
  ArrowUpCircle,
  Repeat,
  Save,
} from "lucide-react";
import { createTransactionAction } from "@/actions/transactions-actions";

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

type RepeatMode =
  | "NONE"
  | "INSTALLMENT"
  | "FIXED_MONTHS"
  | "PROJECT_12_MONTHS";

type AmountMode = "PER_INSTALLMENT" | "TOTAL";

type TransactionFormMobileProps = {
  familyId: string;
  accounts: AccountOption[];
  categories: CategoryOption[];
  creditCards: CreditCardOption[];
  defaultType?: TransactionType;
};

export function TransactionFormMobile({
  familyId,
  accounts,
  categories,
  creditCards,
  defaultType = "EXPENSE",
}: TransactionFormMobileProps) {
  const transactionType = defaultType;
  const isIncome = transactionType === "INCOME";
  const isExpense = transactionType === "EXPENSE";
  const today = new Date().toISOString().slice(0, 10);

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("PIX");
  const [repeatMode, setRepeatMode] = useState<RepeatMode>("NONE");
  const [amountMode, setAmountMode] = useState<AmountMode>("PER_INSTALLMENT");
  const [repeatQuantity, setRepeatQuantity] = useState(2);
  const [amount, setAmount] = useState("");
  const [status, setStatus] = useState<"PAID" | "PENDING" | "OVERDUE">("PAID");
  const [hasDueDate, setHasDueDate] = useState(false);
  const [dueDate, setDueDate] = useState(today);

  const isCreditCardPayment = isExpense && paymentMethod === "CREDIT_CARD";
  const showQuantityField =
    repeatMode === "INSTALLMENT" || repeatMode === "FIXED_MONTHS";

  const filteredCategories = useMemo(
    () => categories.filter((category) => category.type === transactionType),
    [categories, transactionType],
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
        { value: "DEBIT_CARD", label: "Debito" },
        { value: "CREDIT_CARD", label: "Credito" },
        { value: "BANK_TRANSFER", label: "Transferencia" },
        { value: "BOLETO", label: "Boleto" },
        { value: "OTHER", label: "Outro" },
      ];

  function handlePaymentMethodChange(method: PaymentMethod) {
    setPaymentMethod(method);

    if (method === "CREDIT_CARD") {
      setRepeatMode("INSTALLMENT");
      setAmountMode("TOTAL");
      setRepeatQuantity(2);
    }
  }

  function handleRepeatModeChange(value: RepeatMode) {
    setRepeatMode(value);

    if (value === "NONE") {
      setAmountMode("PER_INSTALLMENT");
      setRepeatQuantity(2);
    }

    if (value === "INSTALLMENT") {
      setAmountMode("TOTAL");
      setRepeatQuantity(2);
    }

    if (value === "FIXED_MONTHS") {
      setRepeatQuantity(12);
    }

    if (value === "PROJECT_12_MONTHS") {
      setAmountMode("PER_INSTALLMENT");
      setRepeatQuantity(12);
    }
  }

  function formatCurrency(value: number) {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  }

  function parseAmountValue(value: string) {
    const normalized = value.replace(/\./g, "").replace(",", ".");
    return Number(isNaN(Number(normalized)) ? 0 : Number(normalized));
  }

  const parsedAmount = parseAmountValue(amount);
  const actualQuantity =
    repeatMode === "PROJECT_12_MONTHS" ? 12 : repeatQuantity;
  const perItemValue =
    actualQuantity > 0 ? parsedAmount / actualQuantity : 0;

  return (
    <form action={createTransactionAction} className="mobile-transaction-form">
      <input type="hidden" name="familyId" value={familyId} />
      <input type="hidden" name="type" value={transactionType} />

      <header className="mobile-form-header">
        <Link href="/" className="mobile-form-back">
          <ArrowLeft className="h-4 w-4" />
          Dashboard
        </Link>

        <h2>Novo lancamento</h2>
        <p>{isIncome ? "Entrada recebida." : "Saida, compra ou conta."}</p>
      </header>

      <section className="mobile-form-card">
        <div className="mobile-form-compact-grid">
          <div className="mobile-form-group mobile-form-span-2">
            <label className="mobile-form-label">Descricao</label>
            <input
              required
              name="description"
              placeholder={isIncome ? "Salario" : "Mercado"}
              className="finance-input"
            />
          </div>

          <div className="mobile-form-group">
            <label className="mobile-form-label">Valor</label>
            <input
              required
              name="amount"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              placeholder="R$ 0,00"
              inputMode="decimal"
              className="finance-input mobile-form-value-input"
            />
          </div>

          <div className="mobile-form-group">
            <label className="mobile-form-label">Status</label>
            <select
              name="status"
              value={status}
              onChange={(event) =>
                setStatus(event.target.value as "PAID" | "PENDING" | "OVERDUE")
              }
              className="finance-input"
            >
              <option value="PAID">Pago</option>
              <option value="PENDING">Pendente</option>
              <option value="OVERDUE">Atrasado</option>
            </select>
          </div>
        </div>

        <div className="mobile-type-switch" role="group" aria-label="Tipo">
          <Link
            href="/lancamentos/novo?type=EXPENSE"
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
            href="/lancamentos/novo?type=INCOME"
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
              defaultValue={today}
              className="finance-input"
            />
          </div>

          {isExpense && (
            <div className="mobile-form-group">
              <label className="mobile-form-label">Vencimento</label>
              <label className="mobile-inline-check">
                <input
                  type="checkbox"
                  name="hasDueDate"
                  checked={hasDueDate}
                  onChange={(event) => setHasDueDate(event.target.checked)}
                />
                Usar
              </label>
              {hasDueDate && (
                <input
                  required
                  type="date"
                  name="dueDate"
                  value={dueDate}
                  onChange={(event) => setDueDate(event.target.value)}
                  className="finance-input"
                />
              )}
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
        </div>
      </section>

      <section className="mobile-form-card">
        <div className="mobile-form-compact-grid">
          <div className="mobile-form-group">
            <label className="mobile-form-label">Categoria</label>
            <select name="categoryId" className="finance-input">
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
              <select name="accountId" className="finance-input">
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
              <select required name="creditCardId" className="finance-input">
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
            <strong>Usuario logado</strong>
          </div>
        </div>
      </section>

      <section className="mobile-form-card mobile-form-repeat-card">
        <div className="mobile-repeat-title">
          <Repeat className="h-4 w-4" />
          <span>Repeticao</span>
        </div>

        <div className="mobile-form-compact-grid">
          <div className="mobile-form-group mobile-form-span-2">
            <label className="mobile-form-label">Modo</label>
            <select
              name="repeatMode"
              value={repeatMode}
              onChange={(event) =>
                handleRepeatModeChange(event.target.value as RepeatMode)
              }
              className="finance-input"
            >
              <option value="NONE">Nao repetir</option>
              <option value="INSTALLMENT">Parcelar</option>
              <option value="FIXED_MONTHS">Recorrente</option>
              <option value="PROJECT_12_MONTHS">Fixa</option>
            </select>
          </div>

          {repeatMode !== "NONE" && (
            <>
              {showQuantityField && (
                <div className="mobile-form-group">
                  <label className="mobile-form-label">
                    {repeatMode === "INSTALLMENT" ? "Parcelas" : "Meses"}
                  </label>
                  <input
                    required
                    name="repeatQuantity"
                    type="number"
                    min={2}
                    max={120}
                    value={repeatQuantity}
                    onChange={(event) =>
                      setRepeatQuantity(
                        Math.max(2, Number(event.target.value) || 2),
                      )
                    }
                    className="finance-input"
                  />
                </div>
              )}

              {repeatMode === "PROJECT_12_MONTHS" && (
                <input type="hidden" name="repeatQuantity" value="12" />
              )}

              <div className="mobile-form-group">
                <label className="mobile-form-label">Valor</label>
                <select
                  name="amountMode"
                  value={amountMode}
                  onChange={(event) =>
                    setAmountMode(event.target.value as AmountMode)
                  }
                  className="finance-input"
                >
                  <option value="PER_INSTALLMENT">Por parcela</option>
                  <option value="TOTAL">Total</option>
                </select>
              </div>

              <div className="mobile-series-preview mobile-form-span-2">
                <span>
                  {repeatMode === "PROJECT_12_MONTHS"
                    ? "Fixa sem prazo"
                    : amountMode === "TOTAL"
                      ? `${actualQuantity}x de ${formatCurrency(perItemValue)}`
                      : `${actualQuantity} lancamentos de ${formatCurrency(
                          parsedAmount,
                        )}`}
                </span>
                <strong>
                  Primeiro: {status === "PAID" ? "Pago" : "Pendente"} · Proximos:
                  Pendente
                </strong>
              </div>
            </>
          )}
        </div>
      </section>

      <section className="mobile-form-card">
        <label className="mobile-form-label">Observacoes</label>
        <textarea
          name="notes"
          rows={3}
          placeholder="Opcional"
          className="finance-input resize-none"
        />
      </section>

      <button type="submit" className="mobile-form-submit">
        <Save className="h-4 w-4" />
        Salvar lancamento
      </button>
    </form>
  );
}
