import { notFound } from "next/navigation";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { TransactionEditForm } from "@/components/transactions/TransactionEditForm";
import { getTransactionForEdit } from "@/services/transactions-service";

type EditTransactionPageProps = {
  params: Promise<{
    id: string;
  }>;
  searchParams?: Promise<{
    type?: string;
    scope?: string;
    error?: string;
  }>;
};

type TransactionType = "INCOME" | "EXPENSE";
type EditScope = "SINGLE" | "THIS_AND_NEXT";

function resolveEditType(
  queryType: string | undefined,
  transactionType: TransactionType,
): TransactionType {
  if (queryType === "INCOME" || queryType === "EXPENSE") {
    return queryType;
  }

  return transactionType;
}

function resolveEditScope(scope?: string): EditScope | null {
  if (scope === "SINGLE" || scope === "THIS_AND_NEXT") {
    return scope;
  }

  return null;
}

function getErrorMessage(error?: string) {
  if (error === "paid-outside-limit") {
    return "Não é possível reduzir a série porque já existem parcelas pagas fora do novo limite.";
  }

  if (error === "invalid-total") {
    return "A quantidade total precisa ser maior ou igual à parcela atual.";
  }

  return null;
}

function SeriesEditScopeChoice({
  transactionId,
  currentInstallment,
  totalInstallments,
  errorMessage,
}: {
  transactionId: string;
  currentInstallment: number;
  totalInstallments: number;
  errorMessage: string | null;
}) {
  return (
    <div className="app-container flex min-h-[62vh] items-center justify-center">
      <section className="w-full max-w-xl rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 shadow-2xl shadow-black/50 backdrop-blur-2xl">
        <p className="text-sm font-bold text-cyan-200">
          Parcela {currentInstallment}/{totalInstallments}
        </p>

        <h2 className="mt-2 text-2xl font-black tracking-[-0.04em] text-white">
          Como deseja editar este lançamento?
        </h2>

        <p className="mt-3 text-sm leading-6 app-muted-text">
          Este lançamento pertence a uma série. Escolha o alcance da alteração
          antes de abrir o formulário.
        </p>

        {errorMessage ? (
          <div className="mt-5 rounded-3xl border border-red-500/20 bg-red-500/10 p-4 text-sm font-bold text-red-300">
            {errorMessage}
          </div>
        ) : null}

        <div className="mt-6 grid gap-3">
          <Link
            href={`/lancamentos/${transactionId}/editar?scope=SINGLE`}
            className="app-button-primary w-full"
          >
            Somente este lançamento
          </Link>

          <Link
            href={`/lancamentos/${transactionId}/editar?scope=THIS_AND_NEXT`}
            className="app-button-secondary w-full"
          >
            Este e os próximos lançamentos
          </Link>

          <Link
            href="/lancamentos"
            className="rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-center text-sm font-extrabold text-white/60 transition hover:bg-white/5 hover:text-white"
          >
            Cancelar
          </Link>
        </div>
      </section>
    </div>
  );
}

export default async function EditTransactionPage({
  params,
  searchParams,
}: EditTransactionPageProps) {
  const { id } = await params;
  const query = await searchParams;

  const data = await getTransactionForEdit(id);

  if (!data) {
    notFound();
  }

  const defaultType = resolveEditType(query?.type, data.transaction.type);
  const editScope = resolveEditScope(query?.scope);
  const errorMessage = getErrorMessage(query?.error);

  return (
    <AppShell>
      <div className="app-container">
        {data.transaction.series && !editScope ? (
          <SeriesEditScopeChoice
            transactionId={data.transaction.id}
            currentInstallment={data.transaction.series.currentInstallment}
            totalInstallments={data.transaction.series.totalInstallments}
            errorMessage={errorMessage}
          />
        ) : (
          <TransactionEditForm
            transaction={data.transaction}
            accounts={data.options.accounts}
            categories={data.options.categories}
            creditCards={data.options.creditCards}
            defaultType={defaultType}
            editScope={editScope ?? "SINGLE"}
            errorMessage={errorMessage}
          />
        )}
      </div>
    </AppShell>
  );
}
