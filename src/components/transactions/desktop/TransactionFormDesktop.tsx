"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Repeat, Save } from "lucide-react";
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

type TransactionFormDesktopProps = {
  familyId: string;
  accounts: AccountOption[];
  categories: CategoryOption[];
  creditCards: CreditCardOption[];
  defaultType?: TransactionType;
};

export function TransactionFormDesktop({
  familyId,
  accounts,
  categories,
  creditCards,
  defaultType = "EXPENSE",
}: TransactionFormDesktopProps) {
  const [transactionType, setTransactionType] =
    useState<TransactionType>(defaultType);

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("PIX");
  const [repeatMode, setRepeatMode] = useState<RepeatMode>("NONE");
  const [amountMode, setAmountMode] = useState<AmountMode>("PER_INSTALLMENT");

  const today = new Date().toISOString().slice(0, 10);
  const isIncome = transactionType === "INCOME";
  const isExpense = transactionType === "EXPENSE";
  const isCreditCardPayment = isExpense && paymentMethod === "CREDIT_CARD";
  const showRepeatOptions = isExpense;
  const showQuantityField =
    repeatMode === "INSTALLMENT" || repeatMode === "FIXED_MONTHS";

  const filteredCategories = useMemo(() => {
    return categories.filter((category) => category.type === transactionType);
  }, [categories, transactionType]);

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

    if (type === "INCOME") {
      setPaymentMethod("PIX");
      setRepeatMode("NONE");
      setAmountMode("PER_INSTALLMENT");
    }
  }

  function handlePaymentMethodChange(method: PaymentMethod) {
    setPaymentMethod(method);

    if (method === "CREDIT_CARD") {
      setRepeatMode("INSTALLMENT");
      setAmountMode("TOTAL");
    }
  }

  return (
    <form action={createTransactionAction} className="grid gap-6">
      <input type="hidden" name="familyId" value={familyId} />
      <input type="hidden" name="type" value={transactionType} />

      {isIncome && <input type="hidden" name="status" value="PAID" />}

      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-bold app-faint-text transition hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar para o dashboard
          </Link>

          <h2 className="mt-3 text-3xl font-black tracking-[-0.04em] text-white">
            Novo lançamento
          </h2>

          <p className="mt-2 text-sm app-muted-text">
            {isIncome
              ? "Registre uma entrada recebida. O responsável será definido automaticamente pelo login."
              : "Registre uma saída, conta ou pagamento. O responsável será definido automaticamente pelo login."}
          </p>
        </div>

        <button type="submit" className="app-button-primary">
          <Save className="h-4 w-4" />
          Salvar lançamento
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
                defaultValue={today}
                className="finance-input"
              />
            </div>

            <div>
              
            <label className="mb-2 block text-sm font-bold text-white">
              Data de vencimento
            </label>

            <input
              required
              type="date"
              name="dueDate"
              defaultValue={today}
              className="finance-input"
            />

            <p className="mt-2 text-xs app-faint-text">
              Em parcelas ou contas fixas, os próximos vencimentos serão gerados a partir
              desta data.
            </p>
          </div>

            {isExpense && (
              <div>
                <label className="mb-2 block text-sm font-bold text-white">
                  Status do primeiro lançamento
                </label>

                <select
                  name="status"
                  defaultValue="PAID"
                  className="finance-input"
                >
                  <option value="PAID">Pago</option>
                  <option value="PENDING">Pendente</option>
                  <option value="OVERDUE">Atrasado</option>
                </select>

                {repeatMode !== "NONE" && (
                  <p className="mt-2 text-xs text-amber-300">
                    Em lançamentos repetidos, os próximos meses serão criados
                    como pendentes para não alterar seu saldo futuro.
                  </p>
                )}
              </div>
            )}

            {!isCreditCardPayment && (
              <div>
                <label className="mb-2 block text-sm font-bold text-white">
                  {isIncome ? "Conta de destino" : "Conta"}
                </label>

                <select name="accountId" className="finance-input">
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

                <select required name="creditCardId" className="finance-input">
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

              <select name="categoryId" className="finance-input">
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

          {showRepeatOptions && (
            <section className="rounded-[1.75rem] border border-white/10 bg-black/20 p-5">
              <div className="flex items-start gap-3">
                <div className="app-icon-box h-11 w-11">
                  <Repeat className="h-5 w-5" />
                </div>

                <div>
                  <h3 className="text-lg font-black tracking-[-0.03em] text-white">
                    Repetição da despesa
                  </h3>

                  <p className="mt-1 text-sm app-faint-text">
                    Use para compras parceladas, aluguel por alguns meses,
                    assinatura ou conta fixa.
                  </p>
                </div>
              </div>

              <div className="mt-5 grid gap-5">
                <div>
                  <label className="mb-2 block text-sm font-bold text-white">
                    Como deseja lançar?
                  </label>

                  <select
                    name="repeatMode"
                    value={repeatMode}
                    onChange={(event) => {
                      const value = event.target.value as RepeatMode;
                      setRepeatMode(value);

                      if (value === "NONE") {
                        setAmountMode("PER_INSTALLMENT");
                      }

                      if (value === "INSTALLMENT") {
                        setAmountMode("TOTAL");
                      }
                    }}
                    className="finance-input"
                  >
                    <option value="NONE">Não repetir</option>
                    <option value="INSTALLMENT">Parcelar compra</option>
                    <option value="FIXED_MONTHS">
                      Repetir por alguns meses
                    </option>
                    <option value="PROJECT_12_MONTHS">
                      Recorrente sem prazo definido — projetar 12 meses
                    </option>
                  </select>
                </div>

                {repeatMode !== "NONE" && (
                  <div className="grid gap-5 md:grid-cols-2">
                    {showQuantityField && (
                      <div>
                        <label className="mb-2 block text-sm font-bold text-white">
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
                          defaultValue={
                            repeatMode === "INSTALLMENT" ? 2 : 12
                          }
                          className="finance-input"
                        />
                      </div>
                    )}

                    {repeatMode === "PROJECT_12_MONTHS" && (
                      <input type="hidden" name="repeatQuantity" value="12" />
                    )}

                    <div>
                      <label className="mb-2 block text-sm font-bold text-white">
                        Como interpretar o valor?
                      </label>

                      <select
                        name="amountMode"
                        value={amountMode}
                        onChange={(event) =>
                          setAmountMode(event.target.value as AmountMode)
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
                  <div className="rounded-3xl border border-white/10 bg-white/5 p-4 text-sm leading-6 app-muted-text">
                    {repeatMode === "INSTALLMENT" &&
                      "Exemplo: compra de R$ 1.200 em 6x. Se escolher valor total, o sistema divide automaticamente."}

                    {repeatMode === "FIXED_MONTHS" &&
                      "Exemplo: aluguel por 12 meses. Se escolher valor de cada mês, o mesmo valor será lançado mensalmente."}

                    {repeatMode === "PROJECT_12_MONTHS" &&
                      "Exemplo: internet ou assinatura sem prazo final. O sistema criará uma projeção dos próximos 12 meses."}
                  </div>
                )}
              </div>
            </section>
          )}

          <div>
            <label className="mb-2 block text-sm font-bold text-white">
              Observações
            </label>

            <textarea
              name="notes"
              rows={4}
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