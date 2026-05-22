"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CreditCard, Edit3, EyeOff, Loader2, Power, Trash2, X } from "lucide-react";
import {
  deleteCreditCardAction,
  toggleCreditCardStatusAction,
  updateCreditCardAction,
} from "@/actions/credit-cards-actions";

type CreditCardActionsButtonProps = {
  card: {
    id: string;
    name: string;
    bank: string;
    rawLimitAmount: number;
    closingDay: number;
    dueDay: number;
    active: boolean;
  };
};

function formatInputCurrency(value: number) {
  return value.toFixed(2).replace(".", ",");
}

export function CreditCardActionsButton({ card }: CreditCardActionsButtonProps) {
  const router = useRouter();
  const [mode, setMode] = useState<"edit" | "delete" | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function closeModal() {
    if (isPending) return;
    setMode(null);
    setErrorMessage(null);
  }

  function handleEdit(formData: FormData) {
    setErrorMessage(null);
    startTransition(async () => {
      try {
        const result = await updateCreditCardAction(formData);

        if (!result?.success) {
          setErrorMessage("Nao foi possivel salvar o cartao.");
          return;
        }

        closeModal();
        router.refresh();
      } catch {
        setErrorMessage("Erro ao salvar o cartao. Confira os dados.");
      }
    });
  }

  function handleToggle() {
    const formData = new FormData();
    formData.set("creditCardId", card.id);
    formData.set("currentStatus", String(card.active));

    setErrorMessage(null);
    startTransition(async () => {
      try {
        await toggleCreditCardStatusAction(formData);
        closeModal();
        router.refresh();
      } catch {
        setErrorMessage("Erro ao atualizar o cartao. Tente novamente.");
      }
    });
  }

  function handleDelete() {
    const formData = new FormData();
    formData.set("creditCardId", card.id);

    setErrorMessage(null);
    startTransition(async () => {
      try {
        const result = await deleteCreditCardAction(formData);

        if (!result?.success) {
          setErrorMessage(
            result?.message ??
              "Este cartao possui lancamentos ou faturas e nao pode ser excluido. Voce pode inativa-lo.",
          );
          return;
        }

        closeModal();
        router.refresh();
      } catch {
        setErrorMessage("Erro ao excluir o cartao. Tente novamente.");
      }
    });
  }

  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setMode("edit")}
          className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-black text-white transition hover:bg-white hover:text-black"
        >
          <Edit3 className="h-4 w-4" />
          Editar
        </button>

        <button
          type="button"
          onClick={() => setMode("delete")}
          className="inline-flex items-center justify-center gap-2 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-2 text-xs font-black text-red-300 transition hover:bg-red-500 hover:text-black"
        >
          <Trash2 className="h-4 w-4" />
          Excluir
        </button>
      </div>

      {mode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-[2rem] border border-white/10 bg-[#070A12] p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-xl font-black tracking-[-0.03em] text-white">
                  {mode === "edit" ? "Editar cartao" : "Excluir cartao?"}
                </h3>
                <p className="mt-1 text-sm app-muted-text">
                  {mode === "edit"
                    ? "Atualize limite, datas, banco e status."
                    : "A exclusao so acontece sem lancamentos ou faturas vinculadas."}
                </p>
              </div>

              <button
                type="button"
                onClick={closeModal}
                className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-white transition hover:bg-white hover:text-black"
                disabled={isPending}
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {errorMessage && (
              <div className="mt-4 rounded-2xl border border-red-500/20 bg-red-500/10 p-3 text-sm font-bold text-red-300">
                {errorMessage}
              </div>
            )}

            {mode === "edit" ? (
              <form action={handleEdit} className="mt-5 grid gap-4">
                <input type="hidden" name="creditCardId" value={card.id} />

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-bold text-white">
                      Nome
                    </label>
                    <input
                      required
                      name="name"
                      defaultValue={card.name}
                      className="finance-input"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-bold text-white">
                      Banco
                    </label>
                    <input
                      name="bank"
                      defaultValue={
                        card.bank === "Banco nao informado" ? "" : card.bank
                      }
                      className="finance-input"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold text-white">
                    Limite
                  </label>
                  <input
                    name="limitAmount"
                    defaultValue={formatInputCurrency(card.rawLimitAmount)}
                    inputMode="decimal"
                    className="finance-input"
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-bold text-white">
                      Dia de fechamento
                    </label>
                    <input
                      required
                      name="closingDay"
                      type="number"
                      min={1}
                      max={31}
                      defaultValue={card.closingDay}
                      className="finance-input"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-bold text-white">
                      Dia de vencimento
                    </label>
                    <input
                      required
                      name="dueDay"
                      type="number"
                      min={1}
                      max={31}
                      defaultValue={card.dueDay}
                      className="finance-input"
                    />
                  </div>
                </div>

                <label className="flex items-center gap-3 text-sm font-bold text-white">
                  <input
                    type="checkbox"
                    name="active"
                    defaultChecked={card.active}
                    className="h-4 w-4 rounded border-white/20 bg-transparent text-white"
                  />
                  Cartao ativo
                </label>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="app-button-secondary flex-1"
                    disabled={isPending}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="app-button-primary flex-1"
                    disabled={isPending}
                  >
                    {isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <CreditCard className="h-4 w-4" />
                    )}
                    Salvar
                  </button>
                </div>
              </form>
            ) : (
              <div className="mt-5 grid gap-4">
                <p className="text-sm leading-6 app-muted-text">
                  Se o cartao <strong className="text-white">{card.name}</strong>{" "}
                  tiver lancamentos ou faturas, a exclusao sera bloqueada. Nesse
                  caso, use a inativacao.
                </p>

                <div className="grid gap-3 md:grid-cols-3">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="app-button-secondary"
                    disabled={isPending}
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={handleToggle}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl border border-amber-500/30 bg-amber-500 px-4 py-3 text-sm font-black text-black transition hover:bg-amber-400"
                    disabled={isPending}
                  >
                    {card.active ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Power className="h-4 w-4" />
                    )}
                    {card.active ? "Inativar" : "Ativar"}
                  </button>
                  <button
                    type="button"
                    onClick={handleDelete}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl border border-red-500/30 bg-red-500 px-4 py-3 text-sm font-black text-black transition hover:bg-red-400"
                    disabled={isPending}
                  >
                    {isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                    Excluir
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
