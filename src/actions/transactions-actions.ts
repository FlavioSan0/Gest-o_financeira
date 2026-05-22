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

const SERIES_PAID_OUTSIDE_LIMIT_ERROR = "SERIES_PAID_OUTSIDE_LIMIT";
const SERIES_INVALID_TOTAL_ERROR = "SERIES_INVALID_TOTAL";

const transactionUpdateSelect = {
  id: true,
  familyId: true,
  accountId: true,
  creditCardId: true,
  categoryId: true,
  userId: true,
  type: true,
  description: true,
  amount: true,
  transactionDate: true,
  dueDate: true,
  paidAt: true,
  status: true,
  paymentMethod: true,
  notes: true,
} as const;

type RepeatMetadata = {
  repetitionId: string;
  repetitionType: RepeatMode;
  installmentNumber: number;
  totalInstallments: number;
  amountMode: AmountMode;
  metadataTokens: string[];
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

function addAccountDelta(
  accountDeltas: Map<string, number>,
  accountId: string | null,
  delta: number,
) {
  if (!accountId || delta === 0) {
    return;
  }

  accountDeltas.set(accountId, (accountDeltas.get(accountId) ?? 0) + delta);
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

function getRepeatMetadataTokens(notes: string | null | undefined) {
  return (notes ?? "")
    .split(/\r?\n|;/)
    .map((line) => line.trim())
    .filter((line) =>
      /^(REPETICAO_ID:|REPETICAO_TIPO:|PARCELA:|VALOR_MODO:)/.test(line),
    );
}

function getRepeatMetadata(notes: string | null | undefined) {
  const metadataTokens = getRepeatMetadataTokens(notes);
  const repetitionId = metadataTokens
    .find((line) => line.startsWith("REPETICAO_ID:"))
    ?.replace("REPETICAO_ID:", "")
    .trim();
  const installment = metadataTokens
    .find((line) => line.startsWith("PARCELA:"))
    ?.replace("PARCELA:", "")
    .trim();
  const repetitionType = getRepeatMode(
    metadataTokens
      .find((line) => line.startsWith("REPETICAO_TIPO:"))
      ?.replace("REPETICAO_TIPO:", "")
      .trim() ?? null,
  );
  const amountMode = getAmountMode(
    metadataTokens
      .find((line) => line.startsWith("VALOR_MODO:"))
      ?.replace("VALOR_MODO:", "")
      .trim() ?? null,
  );
  const installmentMatch = installment?.match(/^(\d+)\/(\d+)$/);

  if (!repetitionId || !installmentMatch) {
    return null;
  }

  return {
    repetitionId,
    repetitionType,
    installmentNumber: Number(installmentMatch[1]),
    totalInstallments: Number(installmentMatch[2]),
    amountMode,
    metadataTokens,
  };
}

function getCleanUserNotes(notes: string | null | undefined) {
  return (notes ?? "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(
      (line) =>
        line !== "" &&
        !/^(REPETICAO_ID:|REPETICAO_TIPO:|PARCELA:|VALOR_MODO:)/.test(line),
    )
    .join("\n")
    .trim();
}

function buildNotesPreservingMetadata(
  userNotes: string | null,
  metadataTokens: string[],
) {
  return buildNotesWithMetadata(userNotes, metadataTokens);
}

function buildSeriesMetadataTokens(
  metadata: RepeatMetadata,
  installmentNumber: number,
  totalInstallments: number,
) {
  return [
    `REPETICAO_ID:${metadata.repetitionId}`,
    `REPETICAO_TIPO:${metadata.repetitionType}`,
    `PARCELA:${installmentNumber}/${totalInstallments}`,
    `VALOR_MODO:${metadata.amountMode}`,
  ];
}

function getSeriesInstallmentAmount(
  amount: number,
  metadata: RepeatMetadata | null,
  totalInstallments: number,
) {
  if (metadata?.amountMode === "TOTAL") {
    return Number((amount / totalInstallments).toFixed(2));
  }

  return amount;
}

function parseSeriesTotalInstallments(
  value: string | null,
  fallback: number,
  currentInstallment: number,
) {
  const parsed = parsePositiveInteger(value, fallback);

  if (parsed < 1) {
    throw new Error("A quantidade total precisa ser maior que zero.");
  }

  if (parsed < currentInstallment) {
    throw new Error(SERIES_INVALID_TOTAL_ERROR);
  }

  return parsed;
}

function getSeriesEditMode(value: string | null) {
  return value === "future" ? "future" : "single";
}

function buildSeriesDescription(
  description: string,
  currentInstallmentLabel: string,
  targetInstallmentLabel: string,
) {
  void currentInstallmentLabel;
  void targetInstallmentLabel;

  return description.replace(/\s+\d+\/\d+$/, "").trim();
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
  if (input.repeatMode === "NONE") {
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
    const occurrenceTransactionDate = addMonths(input.transactionDate, index);
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
      description: input.description,
      amount: amountPerOccurrence,
      transactionDate: occurrenceTransactionDate,
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
  const editMode = getSeriesEditMode(getOptionalValue(formData, "editMode"));
  const requestedTotalInstallmentsValue = getOptionalValue(
    formData,
    "seriesTotalInstallments",
  );
  const type = getRequiredValue(formData, "type") as TransactionType;
  const description = getRequiredValue(formData, "description");
  const amount = parseCurrencyValue(getRequiredValue(formData, "amount"));
  const transactionDate = getRequiredValue(formData, "transactionDate");
  const dueDateValue = getOptionalValue(formData, "dueDate");

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
  const familyId = session.familyId;
  const userId = session.userId;
  const baseTransactionDate = createDateFromInput(transactionDate);

  try {
    await prisma.$transaction(
      async (tx) => {
        const [oldTransaction, account, category, creditCard] =
          await Promise.all([
            tx.transaction.findFirst({
              where: {
                id: transactionId,
                familyId,
              },
              select: transactionUpdateSelect,
            }),
            accountId
              ? tx.account.findFirst({
                  where: {
                    id: accountId,
                    familyId,
                    active: true,
                  },
                  select: {
                    id: true,
                  },
                })
              : Promise.resolve(null),
            categoryId
              ? tx.category.findFirst({
                  where: {
                    id: categoryId,
                    familyId,
                    active: true,
                  },
                  select: {
                    id: true,
                  },
                })
              : Promise.resolve(null),
            creditCardId
              ? tx.creditCard.findFirst({
                  where: {
                    id: creditCardId,
                    familyId,
                    active: true,
                  },
                  select: {
                    id: true,
                  },
                })
              : Promise.resolve(null),
          ]);

        if (!oldTransaction) {
          throw new Error("Lançamento não encontrado.");
        }

        if (accountId && !account) {
          throw new Error("Conta invÃ¡lida para esta famÃ­lia.");
        }

        if (categoryId && !category) {
          throw new Error("Categoria invÃ¡lida para esta famÃ­lia.");
        }

        if (creditCardId && !creditCard) {
          throw new Error("CartÃ£o invÃ¡lido para esta famÃ­lia.");
        }

        const oldSeriesMetadata = getRepeatMetadata(oldTransaction.notes);
        const shouldUpdateFuture = Boolean(
          editMode === "future" && oldSeriesMetadata,
        );
        const requestedTotalInstallments =
          shouldUpdateFuture && oldSeriesMetadata
            ? parseSeriesTotalInstallments(
                requestedTotalInstallmentsValue,
                oldSeriesMetadata.totalInstallments,
                oldSeriesMetadata.installmentNumber,
              )
            : oldSeriesMetadata?.totalInstallments ?? null;
        const installmentAmount =
          shouldUpdateFuture && oldSeriesMetadata && requestedTotalInstallments
            ? getSeriesInstallmentAmount(
                amount,
                oldSeriesMetadata,
                requestedTotalInstallments,
              )
            : amount;
        const statusWasChanged = status !== oldTransaction.status;
        const baseDueDate =
          dueDateValue && oldTransaction.dueDate
            ? createDateFromInput(dueDateValue)
            : null;

        const allSeriesItems =
          shouldUpdateFuture && oldSeriesMetadata
            ? (
                await tx.transaction.findMany({
                  where: {
                    familyId,
                    notes: {
                      contains: `REPETICAO_ID:${oldSeriesMetadata.repetitionId}`,
                    },
                  },
                  select: transactionUpdateSelect,
                })
              )
                .map((transaction) => ({
                  transaction,
                  metadata: getRepeatMetadata(transaction.notes),
                }))
                .filter(
                  (item): item is {
                    transaction: typeof oldTransaction;
                    metadata: RepeatMetadata;
                  } =>
                    item.metadata?.repetitionId ===
                    oldSeriesMetadata.repetitionId,
                )
                .sort(
                  (a, b) =>
                    a.metadata.installmentNumber - b.metadata.installmentNumber,
                )
            : [
                {
                  transaction: oldTransaction,
                  metadata: oldSeriesMetadata,
                },
              ];
        const seriesItemsWithMetadata = allSeriesItems.filter(
          (
            item,
          ): item is {
            transaction: typeof oldTransaction;
            metadata: RepeatMetadata;
          } => Boolean(item.metadata),
        );

        if (
          shouldUpdateFuture &&
          oldSeriesMetadata &&
          requestedTotalInstallments
        ) {
          const paidOutsideNewLimit = seriesItemsWithMetadata.some(
            (item) =>
              item.metadata.installmentNumber > requestedTotalInstallments &&
              item.transaction.status === "PAID",
          );

          if (paidOutsideNewLimit) {
            throw new Error(SERIES_PAID_OUTSIDE_LIMIT_ERROR);
          }
        }

        const transactionsToUpdate =
          shouldUpdateFuture &&
          oldSeriesMetadata &&
          requestedTotalInstallments
            ? seriesItemsWithMetadata.filter(
                (item) =>
                  item.metadata.installmentNumber >=
                    oldSeriesMetadata.installmentNumber &&
                  item.metadata.installmentNumber <= requestedTotalInstallments,
              )
            : allSeriesItems;

        const currentInstallmentLabel = oldSeriesMetadata
          ? `${oldSeriesMetadata.installmentNumber}/${oldSeriesMetadata.totalInstallments}`
          : "";

        const transactionUpdates = transactionsToUpdate.map((item) => {
          const currentTransaction = item.transaction;
          const installmentOffset =
            item.metadata && oldSeriesMetadata
              ? item.metadata.installmentNumber -
                oldSeriesMetadata.installmentNumber
              : 0;
          const nextStatus = statusWasChanged
            ? status
            : currentTransaction.status;
          const nextTransactionDate = addMonths(
            baseTransactionDate,
            installmentOffset,
          );
          const nextDueDate = baseDueDate
            ? addMonths(baseDueDate, installmentOffset)
            : null;
          const targetInstallmentLabel = item.metadata
            ? `${item.metadata.installmentNumber}/${item.metadata.totalInstallments}`
            : "";
          const nextDescription =
            shouldUpdateFuture && item.metadata && oldSeriesMetadata
              ? buildSeriesDescription(
                  description,
                  currentInstallmentLabel,
                  targetInstallmentLabel,
                )
              : description;
          const nextNotes = item.metadata
            ? buildNotesPreservingMetadata(
                notes,
                buildSeriesMetadataTokens(
                  item.metadata,
                  item.metadata.installmentNumber,
                  requestedTotalInstallments ?? item.metadata.totalInstallments,
                ),
              )
            : notes;

          return {
            currentTransaction,
            nextStatus,
            nextDescription,
            nextNotes,
            nextTransactionDate,
            nextDueDate,
          };
        });

        const previousMetadataUpdates =
          shouldUpdateFuture &&
          oldSeriesMetadata &&
          requestedTotalInstallments
            ? seriesItemsWithMetadata
                .filter(
                  (item) =>
                    item.metadata.installmentNumber <
                      oldSeriesMetadata.installmentNumber &&
                    item.metadata.installmentNumber <=
                      requestedTotalInstallments,
                )
                .map((item) => ({
                  id: item.transaction.id,
                  notes: buildNotesPreservingMetadata(
                    getCleanUserNotes(item.transaction.notes),
                    buildSeriesMetadataTokens(
                      item.metadata,
                      item.metadata.installmentNumber,
                      requestedTotalInstallments,
                    ),
                  ),
                }))
            : [];

        const canceledIds =
          shouldUpdateFuture && requestedTotalInstallments
            ? seriesItemsWithMetadata
                .filter(
                  (item) =>
                    item.metadata.installmentNumber >
                      requestedTotalInstallments &&
                    item.transaction.status === "PENDING",
                )
                .map((item) => item.transaction.id)
            : [];

        const lastExistingItem = [...seriesItemsWithMetadata].sort(
          (a, b) => b.metadata.installmentNumber - a.metadata.installmentNumber,
        )[0];
        const lastExistingInstallment =
          lastExistingItem?.metadata.installmentNumber ??
          oldSeriesMetadata?.installmentNumber ??
          0;

        const transactionsToCreate =
          shouldUpdateFuture &&
          oldSeriesMetadata &&
          requestedTotalInstallments &&
          requestedTotalInstallments > lastExistingInstallment
            ? Array.from(
                {
                  length: requestedTotalInstallments - lastExistingInstallment,
                },
                (_, index) => {
                  const installmentNumber = lastExistingInstallment + index + 1;
                  const installmentOffset =
                    installmentNumber - oldSeriesMetadata.installmentNumber;
                  const installmentLabel = `${installmentNumber}/${requestedTotalInstallments}`;

                  return {
                    familyId,
                    userId,
                    accountId,
                    creditCardId,
                    categoryId,
                    type,
                    description: buildSeriesDescription(
                      description,
                      currentInstallmentLabel,
                      installmentLabel,
                    ),
                    amount: installmentAmount,
                    transactionDate: addMonths(
                      baseTransactionDate,
                      installmentOffset,
                    ),
                    dueDate: baseDueDate
                      ? addMonths(baseDueDate, installmentOffset)
                      : null,
                    status: "PENDING" as TransactionStatus,
                    paymentMethod,
                    notes: buildNotesPreservingMetadata(
                      notes,
                      buildSeriesMetadataTokens(
                        oldSeriesMetadata,
                        installmentNumber,
                        requestedTotalInstallments,
                      ),
                    ),
                    paidAt: null,
                  };
                },
              )
            : [];

        const accountDeltas = new Map<string, number>();

        transactionUpdates.forEach((item) => {
          const oldImpact =
            item.currentTransaction.paymentMethod === "CREDIT_CARD"
              ? 0
              : getAccountImpactAmount({
                  accountId: item.currentTransaction.accountId,
                  type: item.currentTransaction.type,
                  status: item.currentTransaction.status,
                  amount: Number(item.currentTransaction.amount),
                });
          const nextImpact = isCreditCardPayment
            ? 0
            : getAccountImpactAmount({
                accountId,
                type,
                status: item.nextStatus,
                amount: installmentAmount,
              });

          addAccountDelta(
            accountDeltas,
            item.currentTransaction.accountId,
            -oldImpact,
          );
          addAccountDelta(accountDeltas, accountId, nextImpact);
        });

        const accountImpactUpdates = Array.from(accountDeltas.entries())
          .filter(([, delta]) => delta !== 0)
          .map(([id, delta]) =>
            tx.account.update({
              where: {
                id,
              },
              data: {
                currentBalance: {
                  increment: delta,
                },
              },
            }),
          );

        const updateOperations = transactionUpdates.map((item) =>
          tx.transaction.update({
            where: {
              id: item.currentTransaction.id,
            },
            data: {
              accountId,
              creditCardId,
              categoryId,
              type,
              description: item.nextDescription,
              amount: installmentAmount,
              transactionDate: item.nextTransactionDate,
              dueDate: item.nextDueDate,
              status: item.nextStatus,
              paymentMethod,
              notes: item.nextNotes,
              paidAt:
                item.nextStatus === "PAID"
                  ? item.currentTransaction.paidAt ?? new Date()
                  : null,
            },
          }),
        );

        const previousMetadataOperations = previousMetadataUpdates.map((item) =>
          tx.transaction.update({
            where: {
              id: item.id,
            },
            data: {
              notes: item.notes,
            },
          }),
        );

        await Promise.all([
          ...accountImpactUpdates,
          ...updateOperations,
          ...previousMetadataOperations,
          canceledIds.length > 0
            ? tx.transaction.updateMany({
                where: {
                  id: {
                    in: canceledIds,
                  },
                  familyId,
                  status: "PENDING",
                },
                data: {
                  status: "CANCELED",
                  paidAt: null,
                },
              })
            : Promise.resolve(null),
          transactionsToCreate.length > 0
            ? tx.transaction.createMany({
                data: transactionsToCreate,
              })
            : Promise.resolve(null),
        ]);
      },
      {
        timeout: 20000,
      },
    );
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === SERIES_PAID_OUTSIDE_LIMIT_ERROR
    ) {
      redirect(
        `/lancamentos/${transactionId}/editar?scope=THIS_AND_NEXT&error=paid-outside-limit`,
      );
    }

    if (
      error instanceof Error &&
      error.message === SERIES_INVALID_TOTAL_ERROR
    ) {
      redirect(
        `/lancamentos/${transactionId}/editar?scope=THIS_AND_NEXT&error=invalid-total`,
      );
    }

    throw error;
  }

  revalidateFinancialPages(session.familyId);

  redirect("/lancamentos");
}

export async function deleteTransactionAction(formData: FormData) {
  const session = await requireSession();

  const transactionId = getRequiredValue(formData, "transactionId");

  await prisma.$transaction(async () => {
    const transaction = await prisma.transaction.findFirst({
      where: {
        id: transactionId,
        familyId: session.familyId,
      },
    });

    if (!transaction) {
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
