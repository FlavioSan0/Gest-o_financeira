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

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("PIX");
  const [repeatMode, setRepeatMode] = useState<"NONE" | "INSTALLMENT" | "FIXED_MONTHS" | "PROJECT_12_MONTHS">("NONE");
  const [amountMode, setAmountMode] = useState<"PER_INSTALLMENT" | "TOTAL">("PER_INSTALLMENT");
  const [repeatQuantity, setRepeatQuantity] = useState(2);
  const [amount, setAmount] = useState("");
  const [status, setStatus] = useState<"PAID" | "PENDING" | "OVERDUE">("PAID");
  const [hasDueDate, setHasDueDate] = useState(false);

  const isCreditCardPayment = isExpense && paymentMethod === "CREDIT_CARD";
  const showQuantityField =
    repeatMode === "INSTALLMENT" || repeatMode === "FIXED_MONTHS";

  const filteredCategories = useMemo(
    () => categories.filter((category) => category.type === transactionType),
    [categories, transactionType],
  );

  function handlePaymentMethodChange(method: PaymentMethod) {
    setPaymentMethod(method);

    if (method === "CREDIT_CARD") {
      setRepeatMode("INSTALLMENT");
      setAmountMode("TOTAL");
      setRepeatQuantity(2);
    }
  }

  function handleRepeatModeChange(value: "NONE" | "INSTALLMENT" | "FIXED_MONTHS" | "PROJECT_12_MONTHS") {
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

  const today = new Date().toISOString().slice(0, 10);
  const [dueDate, setDueDate] = useState(today);

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

  function addMonths(date: Date, months: number) {
    const result = new Date(date);
    const day = result.getDate();
    result.setMonth(result.getMonth() + months);
    if (result.getDate() !== day) {
      result.setDate(0);
    }
    return result;
  }

  return (
    <form action={createTransactionAction} className="mobile-transaction-form">
      <input type="hidden" name="familyId" value={familyId} />
      <input type="hidden" name="type" value={transactionType} />

      {isIncome && <input type="hidden" name="status" value="PAID" />}

      <header className="mobile-form-header">
        <Link href="/" className="mobile-form-back">
          <ArrowLeft className="h-4 w-4" />
          Dashboard
        </Link>

        <h2>Novo lançamento</h2>

        <p>
          {isIncome
            ? "Registre uma entrada recebida e mantenha o saldo atualizado."
            : "Registre uma saída, compra, conta ou pagamento."}
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
            <span>Saída</span>
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
            placeholder={isIncome ? "Ex: Salário" : "Ex: Mercado"}
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
          <label className="mobile-form-label">
            {isIncome ? "Data de recebimento" : "Data do lançamento"}
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
            <label className="flex items-center gap-3 mobile-form-label">
              <input
                type="checkbox"
                name="hasDueDate"
                checked={hasDueDate}
                onChange={(event) => setHasDueDate(event.target.checked)}
                className="h-4 w-4 rounded border-white/20 bg-transparent text-white"
              />
              Esta despesa tem vencimento
            </label>

            {hasDueDate && (
              <>
                <input
                  required
                  type="date"
                  name="dueDate"
                  value={dueDate}
                  onChange={(event) => setDueDate(event.target.value)}
                  className="finance-input"
                />

                <p className="mobile-form-helper">
                  Em parcelas ou contas fixas, os próximos vencimentos serão
                  gerados a partir desta data.
                </p>
              </>
            )}
          </div>
        )}

        {isExpense && (
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
        )}
      </section>

      {isExpense && (
        <section className="mobile-form-card mobile-form-repeat-card">
          <div className="flex items-start gap-3">
            <div className="app-icon-box h-10 w-10">
              <Repeat className="h-5 w-5" />
            </div>

            <div>
              <label className="mobile-form-label">Repetição da despesa</label>
              <p className="mobile-form-helper">
                Use para compras parceladas, aluguel, assinatura ou conta fixa.
              </p>
            </div>
          </div>

          <div className="mt-4 space-y-4">
            <div>
              <label className="mobile-form-label">Como deseja lançar?</label>

              <select
                name="repeatMode"
                value={repeatMode}
                onChange={(event) =>
                  handleRepeatModeChange(
                    event.target.value as
                      | "NONE"
                      | "INSTALLMENT"
                      | "FIXED_MONTHS"
                      | "PROJECT_12_MONTHS",
                  )
                }
                className="finance-input"
              >
                <option value="NONE">Não repetir</option>
                <option value="INSTALLMENT">Parcelar compra</option>
                <option value="FIXED_MONTHS">Repetir por alguns meses</option>
                <option value="PROJECT_12_MONTHS">
                  Recorrente sem prazo definido — projetar 12 meses
                </option>
              </select>
            </div>

            {repeatMode !== "NONE" && (
              <div className="grid gap-4">
                {showQuantityField && (
                  <div>
                    <label className="mobile-form-label">
                      {repeatMode === "INSTALLMENT"
                        ? "Quantidade de parcelas"
                        : "Quantidade de meses"}
                    </label>

                    <input
                      required
                      name="repeatQuantity"
                      type="number"
                      min={2}
                      max={120}
                      value={repeatQuantity}
                      onChange={(event) =>
                        setRepeatQuantity(Math.max(2, Number(event.target.value)))
                      }
                      className="finance-input"
                    />
                  </div>
                )}

                {repeatMode === "PROJECT_12_MONTHS" && (
                  <input type="hidden" name="repeatQuantity" value="12" />
                )}

                <div>
                  <label className="mobile-form-label">
                    Como interpretar o valor?
                  </label>

                  <select
                    name="amountMode"
                    value={amountMode}
                    onChange={(event) =>
                      setAmountMode(event.target.value as "PER_INSTALLMENT" | "TOTAL")
                    }
                    className="finance-input"
                  >
                    <option value="PER_INSTALLMENT">
                      Valor de cada mês/parcela
                    </option>
                    <option value="TOTAL">
                      Valor total para dividir
                    </option>
                  </select>
                </div>
              </div>
            )}

            {repeatMode !== "NONE" && (
              <>
                <p className="mobile-form-helper text-amber-300">
                  O próximo lançamento será criado como pendente para não alterar o
                  saldo futuro.
                </p>

                <div className="rounded-3xl border border-white/10 bg-white/5 p-4 text-sm text-white/80">
                  <p className="font-bold text-white">
                    {(() => {
                      const parsedAmount = parseAmountValue(amount);
                      const actualQuantity =
                        repeatMode === "PROJECT_12_MONTHS" ? 12 : repeatQuantity;
                      const perItemValue =
                        actualQuantity > 0
                          ? parsedAmount / actualQuantity
                          : 0;

                      if (repeatMode === "PROJECT_12_MONTHS") {
                        return "Será criada uma projeção de 12 meses";
                      }

                      if (amountMode === "TOTAL") {
                        const label =
                          repeatMode === "INSTALLMENT"
                            ? "parcelas"
                            : "lançamentos";
                        return `${formatCurrency(parsedAmount)} dividido em ${actualQuantity} ${label} de ${formatCurrency(
                          perItemValue,
                        )}`;
                      }

                      return `${actualQuantity} lançamentos de ${formatCurrency(
                        parsedAmount,
                      )}`;
                    })()}
                  </p>
                  <p className="mt-2 text-xs app-faint-text">
                    Primeiro lançamento:{" "}
                    {status === "PAID"
                      ? "Pago"
                      : status === "PENDING"
                      ? "Pendente"
                      : "Atrasado"}
                    . Próximos: Pendente.
                  </p>
                  {hasDueDate && dueDate && (
                    <p className="mt-2 text-xs app-faint-text">
                      Vencimento:{" "}
                      {new Date(dueDate).toLocaleDateString("pt-BR")} até{' '}
                      {addMonths(
                        new Date(dueDate),
                        repeatMode === "PROJECT_12_MONTHS"
                          ? 11
                          : repeatQuantity - 1,
                      ).toLocaleDateString("pt-BR")}
                    </p>
                  )}
                </div>
              </>
            )}
          </div>
        </section>
      )}

      <section className="mobile-form-card">
        {!isCreditCardPayment && (
          <div className="mobile-form-group">
            <label className="mobile-form-label">
              {isIncome ? "Conta de destino" : "Conta"}
            </label>

            <select name="accountId" className="finance-input">
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

          <select name="categoryId" className="finance-input">
            <option value="">Sem categoria</option>

            {filteredCategories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
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

            <select required name="creditCardId" className="finance-input">
              <option value="">Selecione um cartão</option>

              {creditCards.map((card) => (
                <option key={card.id} value={card.id}>
                  {card.name} • {card.bank}
                </option>
              ))}
            </select>
          </div>

          <p className="mobile-form-helper">
            Compras no crédito não alteram o saldo da conta agora. Elas serão usadas
            para controle de fatura.
          </p>
        </section>
      )}

      <section className="mobile-form-card">
        <label className="mobile-form-label">Observações</label>

        <textarea
          name="notes"
          rows={4}
          placeholder="Informações adicionais..."
          className="finance-input resize-none"
        />
      </section>

      <button type="submit" className="mobile-form-submit">
        <Save className="h-4 w-4" />
        Salvar lançamento
      </button>
    </form>
  );
}