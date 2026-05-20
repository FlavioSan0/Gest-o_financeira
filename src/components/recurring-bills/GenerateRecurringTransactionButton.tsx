"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Loader2, PlusCircle } from "lucide-react";
import { generateRecurringTransactionAction } from "@/actions/recurring-bills-actions";

type GenerateRecurringTransactionButtonProps = {
  recurringBillId: string;
  disabled: boolean;
  alreadyGenerated: boolean;
};

export function GenerateRecurringTransactionButton({
  recurringBillId,
  disabled,
  alreadyGenerated,
}: GenerateRecurringTransactionButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  function handleGenerate() {
    if (disabled || isPending) return;

    setErrorMessage(null);

    startTransition(async () => {
      try {
        const result = await generateRecurringTransactionAction(
          recurringBillId,
        );

        if (!result?.success) {
          setErrorMessage("Não foi possível gerar o lançamento.");
          return;
        }

        router.refresh();
      } catch (error) {
        console.error(error);
        setErrorMessage("Erro ao gerar lançamento.");
      }
    });
  }

  return (
    <div className="grid gap-1">
      <button
        type="button"
        onClick={handleGenerate}
        disabled={disabled || isPending}
        className={
          alreadyGenerated
            ? "inline-flex items-center justify-center gap-2 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-2 text-xs font-black text-emerald-400 opacity-70"
            : "inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-black text-white transition hover:bg-white hover:text-black disabled:cursor-not-allowed disabled:opacity-50"
        }
      >
        {isPending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : alreadyGenerated ? (
          <CheckCircle2 className="h-4 w-4" />
        ) : (
          <PlusCircle className="h-4 w-4" />
        )}

        {isPending
          ? "Gerando..."
          : alreadyGenerated
            ? "Já gerada"
            : "Gerar mês"}
      </button>

      {errorMessage && (
        <span className="text-[0.68rem] font-bold text-red-300">
          {errorMessage}
        </span>
      )}
    </div>
  );
}