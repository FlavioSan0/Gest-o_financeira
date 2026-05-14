"use client";

import { useState } from "react";
import { AlertTriangle, Trash2, X } from "lucide-react";
import { deleteTransactionAction } from "@/actions/transactions-actions";

type DeleteTransactionButtonProps = {
  transactionId: string;
  transactionDescription: string;
};

export function DeleteTransactionButton({
  transactionId,
  transactionDescription,
}: DeleteTransactionButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-red-500/20 bg-red-500/10 text-red-400 transition hover:bg-red-500 hover:text-white"
        title="Excluir lançamento"
      >
        <Trash2 className="h-4 w-4" />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-[2rem] border border-white/10 bg-[#070A12] p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-red-500/20 bg-red-500/10 text-red-400">
                <AlertTriangle className="h-6 w-6" />
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-white transition hover:bg-white hover:text-black"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <h3 className="mt-5 text-xl font-black tracking-[-0.03em] text-white">
              Excluir lançamento?
            </h3>

            <p className="mt-2 text-sm leading-6 app-muted-text">
              Você está prestes a excluir o lançamento{" "}
              <strong className="text-white">{transactionDescription}</strong>.
              Essa ação não poderá ser desfeita.
            </p>

            <form action={deleteTransactionAction} className="mt-6 flex gap-3">
              <input type="hidden" name="transactionId" value={transactionId} />

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="app-button-secondary flex-1"
              >
                Cancelar
              </button>

              <button
                type="submit"
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl border border-red-500/30 bg-red-500 px-4 py-3 text-sm font-black text-white transition hover:bg-red-600"
              >
                <Trash2 className="h-4 w-4" />
                Excluir
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}