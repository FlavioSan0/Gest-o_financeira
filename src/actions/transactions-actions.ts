"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { familyCacheTags } from "@/lib/cache-tags";

type TransactionType = "INCOME" | "EXPENSE";
type TransactionStatus = "PAID" | "PENDING" | "OVERDUE" | "CANCELED";
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

type AccountImpactInput = {
  accountId: string | null;
  type: TransactionType;
  status: TransactionStatus;
  amount: number;
};

type TransactionCreateInput = {
  familyId: string;
  userId: string;
  accountId: string | null;
  creditCardId: string | null;
  categoryId: string | null;
  type: TransactionType;
  description: string;
  amount: number;
  transactionDate: Date;
  dueDate: Date | null;
  status: TransactionStatus;
  paymentMethod: PaymentMethod;
  notes: string | null;
};

function getRequiredValue(formData: FormData, field: string) {
  const value = formData.get(field);

  if (!value || typeof value !== "string" || value.trim() === "") {
    throw new Error(`Campo obrigatório não informado: ${field}`);
  }

  return value.trim();
}

function getOptionalValue(formData: FormData, field: string) {
  const value = formData.get(field);

  if (!value || typeof value !== "string" || value.trim() === "") {
    return null;
  }

  return value.trim();
}

function parseCurrencyValue(value: string) {
  const normalized = value
    .replace(/\./g, "")
    .replace(",", ".")
    .replace(/[^\d.-]/g, "");

  const numericValue = Number(normalized);

  if (Number.isNaN(numericValue) || numericValue <= 0) {
    throw new Error("Valor inválido.");
  }

  return numericValue;
}

function parsePositiveInteger(value: string | null, fallback: number) {
  if (!value) return fallback;

  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed <= 0) {
    return fallback;
  }

  return parsed;
}

function getRepeatMode(value: string | null): RepeatMode {
  if (
    value === "INSTALLMENT" ||
    value === "FIXED_MONTHS" ||
    value === "PROJECT_12_MONTHS"
  ) {
    return value;
  }

  return "NONE";
}

function getAmountMode(value: string | null): AmountMode {
  if (value === "TOTAL") {
    return "TOTAL";
  }

  return "PER_INSTALLMENT";
}

function shouldAffectAccount(input: AccountImpactInput) {
  return Boolean(input.accountId) && input.status === "PAID";
}

function getAccountImpactAmount(input: AccountImpactInput) {
  if (!shouldAffectAccount(input)) {
    return 0;
  }

  return input.type === "INCOME" ? input.amount : -input.amount;
}

async function applyAccountImpact(input: AccountImpactInput) {
  const impact = getAccountImpactAmount(input);

  if (!input.accountId || impact === 0) {
    return;
  }

  await prisma.account.update({
    where: {
      id: input.accountId,
    },
    data: {
      currentBalance: {
        increment: impact,
      },
    },
  });
}

async function revertAccountImpact(input: AccountImpactInput) {
  const impact = getAccountImpactAmount(input);

  if (!input.accountId || impact === 0) {
    return;
  }

  await prisma.account.update({
    where: {
      id: input.accountId,
    },
    data: {
      currentBalance: {
        decrement: impact,
      },
    },
  });
}

async function validateAccountBelongsToFamily(
  accountId: string | null,
  familyId: string,
) {
  if (!accountId) return;

  const account = await prisma.account.findFirst({
    where: {
      id: accountId,
      familyId,
      active: true,
    },
  });

  if (!account) {
    throw new Error("Conta inválida para esta família.");
  }
}

async function validateCategoryBelongsToFamily(
  categoryId: string | null,
  familyId: string,
) {
  if (!categoryId) return;

  const category = await prisma.category.findFirst({
    where: {
      id: categoryId,
      familyId,
      active: true,
    },
  });

  if (!category) {
    throw new Error("Categoria inválida para esta família.");
  }
}

async function validateCreditCardBelongsToFamily(
  creditCardId: string | null,
  familyId: string,
) {
  if (!creditCardId) return;

  const creditCard = await prisma.creditCard.findFirst({
    where: {
      id: creditCardId,
      familyId,
      active: true,
    },
  });

  if (!creditCard) {
    throw new Error("Cartão inválido para esta família.");
  }
}

function revalidateFinancialPages(familyId: string) {
  const tags = familyCacheTags(familyId);

  revalidateTag(tags.dashboard, "max");
  revalidateTag(tags.transactions, "max");
  revalidateTag(tags.accounts, "max");
  revalidateTag(tags.cards, "max");
  revalidateTag(tags.recurring, "max");
  revalidatePath("/");
  revalidatePath("/dashboard");
  revalidatePath("/lancamentos");
  revalidatePath("/lancamentos/novo");
  revalidatePath("/contas");
  revalidatePath("/cartoes");
  revalidatePath("/cartoes/faturas");
}

function createDateFromInput(value: string) {
  return new Date(`${value}T12:00:00`);
}

function addMonths(baseDate: Date, monthsToAdd: number) {
  const year = baseDate.getFullYear();
  const month = baseDate.getMonth();
  const day = baseDate.getDate();

  const targetLastDay = new Date(year, month + monthsToAdd + 1, 0).getDate();
  const safeDay = Math.min(day, targetLastDay);

  return new Date(year, month + monthsToAdd, safeDay, 12, 0, 0);
}

function createRepetitionId() {
  return `rep_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

function buildNotesWithMetadata(
  originalNotes: string | null,
  metadata: string[],
) {
  const cleanNotes = originalNotes?.trim();

  if (!cleanNotes) {
    return metadata.join(";");
  }

  return `${cleanNotes}\n\n${metadata.join(";")}`;
}

function buildTransactions(input: {
  familyId: string;
  userId: string;
  accountId: string | null;
  creditCardId: string | null;
  categoryId: string | null;
  type: TransactionType;
  description: string;
  amount: number;
  transactionDate: Date;
  dueDate: Date | null;
  status: TransactionStatus;
  paymentMethod: PaymentMethod;
  notes: string | null;
  repeatMode: RepeatMode;
  repeatQuantity: number;
  amountMode: AmountMode;
}): TransactionCreateInput[] {
  if (input.type === "INCOME" || input.repeatMode === "NONE") {
    return [
      {
        familyId: input.familyId,
        userId: input.userId,
        accountId: input.accountId,
        creditCardId: input.creditCardId,
        categoryId: input.categoryId,
        type: input.type,
        description: input.description,
        amount: input.amount,
        transactionDate: input.transactionDate,
        dueDate: input.dueDate,
        status: input.status,
        paymentMethod: input.paymentMethod,
        notes: input.notes,
      },
    ];
  }

  const quantity =
    input.repeatMode === "PROJECT_12_MONTHS" ? 12 : input.repeatQuantity;

  const safeQuantity = Math.min(Math.max(quantity, 1), 120);

  const amountPerOccurrence =
    input.amountMode === "TOTAL"
      ? Number((input.amount / safeQuantity).toFixed(2))
      : input.amount;

  const repetitionId = createRepetitionId();

  return Array.from({ length: safeQuantity }, (_, index) => {
    const installmentNumber = index + 1;
    const occurrenceDueDate = input.dueDate
      ? addMonths(input.dueDate, index)
      : null;

    const metadata = [
      `REPETICAO_ID:${repetitionId}`,
      `REPETICAO_TIPO:${input.repeatMode}`,
      `PARCELA:${installmentNumber}/${safeQuantity}`,
      `VALOR_MODO:${input.amountMode}`,
    ];

    const occurrenceStatus: TransactionStatus =
      index === 0 ? input.status : "PENDING";

    return {
      familyId: input.familyId,
      userId: input.userId,
      accountId: input.accountId,
      creditCardId: input.creditCardId,
      categoryId: input.categoryId,
      type: input.type,
      description: `${input.description} ${installmentNumber}/${safeQuantity}`,
      amount: amountPerOccurrence,
      transactionDate: input.transactionDate,
      dueDate: occurrenceDueDate,
      status: occurrenceStatus,
      paymentMethod: input.paymentMethod,
      notes: buildNotesWithMetadata(input.notes, metadata),
    };
  });
}

export async function createTransactionAction(formData: FormData) {
  const session = await requireSession();

  const familyId = session.familyId;
  const userId = session.userId;

  const type = getRequiredValue(formData, "type") as TransactionType;
  const description = getRequiredValue(formData, "description");
  const amount = parseCurrencyValue(getRequiredValue(formData, "amount"));
  const transactionDate = getRequiredValue(formData, "transactionDate");

  const hasDueDate = getOptionalValue(formData, "hasDueDate") === "on";
  const dueDateValue =
    type === "EXPENSE" && hasDueDate
      ? getRequiredValue(formData, "dueDate")
      : null;

  const rawPaymentMethod = getOptionalValue(formData, "paymentMethod") ?? "PIX";
  const paymentMethod = rawPaymentMethod as PaymentMethod;

  const isCreditCardPayment =
    type === "EXPENSE" && paymentMethod === "CREDIT_CARD";

  const accountId = isCreditCardPayment
    ? null
    : getOptionalValue(formData, "accountId");

  const creditCardId = isCreditCardPayment
    ? getRequiredValue(formData, "creditCardId")
    : null;

  const categoryId = getOptionalValue(formData, "categoryId");
  const notes = getOptionalValue(formData, "notes");

  const status = (getOptionalValue(formData, "status") ??
    "PAID") as TransactionStatus;

  const repeatMode = getRepeatMode(getOptionalValue(formData, "repeatMode"));
  const repeatQuantity = parsePositiveInteger(
    getOptionalValue(formData, "repeatQuantity"),
    repeatMode === "PROJECT_12_MONTHS" ? 12 : 1,
  );
  const amountMode = getAmountMode(getOptionalValue(formData, "amountMode"));

  await prisma.$transaction(async () => {
    await validateAccountBelongsToFamily(accountId, familyId);
    await validateCategoryBelongsToFamily(categoryId, familyId);
    await validateCreditCardBelongsToFamily(creditCardId, familyId);

    const transactionsToCreate = buildTransactions({
      familyId,
      userId,
      accountId,
      creditCardId,
      categoryId,
      type,
      description,
      amount,
      transactionDate: createDateFromInput(transactionDate),
      dueDate: dueDateValue ? createDateFromInput(dueDateValue) : null,
      status,
      paymentMethod,
      notes,
      repeatMode,
      repeatQuantity,
      amountMode,
    });

    const createdTransactions = await Promise.all(
      transactionsToCreate.map((transaction) =>
        prisma.transaction.create({
          data: {
            familyId: transaction.familyId,
            accountId: transaction.accountId,
            creditCardId: transaction.creditCardId,
            categoryId: transaction.categoryId,
            userId: transaction.userId,
            type: transaction.type,
            description: transaction.description,
            amount: transaction.amount,
            transactionDate: transaction.transactionDate,
            dueDate: transaction.dueDate,
            status: transaction.status,
            paymentMethod: transaction.paymentMethod,
            notes: transaction.notes,
            paidAt: transaction.status === "PAID" ? new Date() : null,
          },
        }),
      ),
    );

    const hasInvalidUserLink = createdTransactions.some(
      (transaction) => !transaction.userId,
    );

    if (hasInvalidUserLink) {
      throw new Error("Falha ao vincular o lançamento ao usuário logado.");
    }

    if (!isCreditCardPayment) {
      for (const transaction of transactionsToCreate) {
        await applyAccountImpact({
          accountId,
          type: transaction.type,
          status: transaction.status,
          amount: transaction.amount,
        });
      }
    }
  });

  revalidateFinancialPages(familyId);

  redirect("/lancamentos");
}

export async function updateTransactionAction(formData: FormData) {
  const session = await requireSession();

  const transactionId = getRequiredValue(formData, "transactionId");
  const type = getRequiredValue(formData, "type") as TransactionType;
  const description = getRequiredValue(formData, "description");
  const amount = parseCurrencyValue(getRequiredValue(formData, "amount"));
  const transactionDate = getRequiredValue(formData, "transactionDate");
  const dueDateValue = getOptionalValue(formData, "dueDate");

  const rawPaymentMethod = getOptionalValue(formData, "paymentMethod") ?? "PIX";
  const paymentMethod = rawPaymentMethod as PaymentMethod;

  const isCreditCardPayment = paymentMethod === "CREDIT_CARD";

  const accountId = isCreditCardPayment
    ? null
    : getOptionalValue(formData, "accountId");

  const creditCardId = isCreditCardPayment
    ? getRequiredValue(formData, "creditCardId")
    : null;

  const categoryId = getOptionalValue(formData, "categoryId");
  const notes = getOptionalValue(formData, "notes");

  const status = (getOptionalValue(formData, "status") ??
    "PAID") as TransactionStatus;

  await prisma.$transaction(async () => {
    const oldTransaction = await prisma.transaction.findUnique({
      where: {
        id: transactionId,
      },
    });

    if (!oldTransaction || oldTransaction.familyId !== session.familyId) {
      throw new Error("Lançamento não encontrado.");
    }

    await validateAccountBelongsToFamily(accountId, session.familyId);
    await validateCategoryBelongsToFamily(categoryId, session.familyId);
    await validateCreditCardBelongsToFamily(creditCardId, session.familyId);

    if (oldTransaction.paymentMethod !== "CREDIT_CARD") {
      await revertAccountImpact({
        accountId: oldTransaction.accountId,
        type: oldTransaction.type,
        status: oldTransaction.status,
        amount: Number(oldTransaction.amount),
      });
    }

    await prisma.transaction.update({
      where: {
        id: transactionId,
      },
      data: {
        accountId,
        creditCardId,
        categoryId,
        type,
        description,
        amount,
        transactionDate: createDateFromInput(transactionDate),
        dueDate: dueDateValue ? createDateFromInput(dueDateValue) : null,
        status,
        paymentMethod,
        notes,
        paidAt: status === "PAID" ? new Date() : null,
      },
    });

    if (!isCreditCardPayment) {
      await applyAccountImpact({
        accountId,
        type,
        status,
        amount,
      });
    }
  });

  revalidateFinancialPages(session.familyId);

  redirect("/lancamentos");
}

export async function deleteTransactionAction(formData: FormData) {
  const session = await requireSession();

  const transactionId = getRequiredValue(formData, "transactionId");

  await prisma.$transaction(async () => {
    const transaction = await prisma.transaction.findUnique({
      where: {
        id: transactionId,
      },
    });

    if (!transaction || transaction.familyId !== session.familyId) {
      throw new Error("Lançamento não encontrado.");
    }

    if (transaction.paymentMethod !== "CREDIT_CARD") {
      await revertAccountImpact({
        accountId: transaction.accountId,
        type: transaction.type,
        status: transaction.status,
        amount: Number(transaction.amount),
      });
    }

    await prisma.transaction.delete({
      where: {
        id: transactionId,
      },
    });
  });

  revalidateFinancialPages(session.familyId);

  redirect("/lancamentos");
}
