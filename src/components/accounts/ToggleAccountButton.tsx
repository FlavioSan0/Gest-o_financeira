"use client";

import { useState } from "react";
import { AlertTriangle, EyeOff, Power, X } from "lucide-react";
import { toggleAccountStatusAction } from "@/actions/accounts-actions";

type ToggleAccountButtonProps = {
  accountId: string;
  accountName: string;
  active: boolean;
};

export function ToggleAccountButton({
  accountId,
  accountName,
  active,
}: ToggleAccountButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  const actionLabel = active ? "Inativar" : "Ativar";

  const description = active
    ? "Essa conta não aparecerá mais em novos lançamentos, mas continuará no histórico."
    : "Essa conta voltará a aparecer nos novos lançamentos.";

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={
          active
            ? "inline-flex items-center justify-center gap-2 rounded-2xl border border-amber-500/20 bg-amber-500/10 px-4 py-2 text-xs font-black text-amber-400 transition hover:bg-amber-500 hover:text-black"
            : "inline-flex items-center justify-center gap-2 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-2 text-xs font-black text-emerald-400 transition hover:bg-emerald-500 hover:text-black"
        }
      >
        {active ? <EyeOff className="h-4 w-4" /> : <Power className="h-4 w-4" />}
        {actionLabel}
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-[2rem] border border-white/10 bg-[#070A12] p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-amber-500/20 bg-amber-500/10 text-amber-400">
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
              {actionLabel} conta?
            </h3>

            <p className="mt-2 text-sm leading-6 app-muted-text">
              Você está prestes a {actionLabel.toLowerCase()} a conta{" "}
              <strong className="text-white">{accountName}</strong>.{" "}
              {description}
            </p>

            <form action={toggleAccountStatusAction} className="mt-6 flex gap-3">
              <input type="hidden" name="accountId" value={accountId} />
              <input
                type="hidden"
                name="currentStatus"
                value={String(active)}
              />

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="app-button-secondary flex-1"
              >
                Cancelar
              </button>

              <button
                type="submit"
                className={
                  active
                    ? "inline-flex flex-1 items-center justify-center gap-2 rounded-2xl border border-amber-500/30 bg-amber-500 px-4 py-3 text-sm font-black text-black transition hover:bg-amber-400"
                    : "inline-flex flex-1 items-center justify-center gap-2 rounded-2xl border border-emerald-500/30 bg-emerald-500 px-4 py-3 text-sm font-black text-black transition hover:bg-emerald-400"
                }
              >
                {active ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Power className="h-4 w-4" />
                )}
                {actionLabel}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}