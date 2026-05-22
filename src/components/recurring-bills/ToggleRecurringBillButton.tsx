"use client";

import { useEffect, useState, useTransition } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { AlertTriangle, EyeOff, Loader2, Power, X } from "lucide-react";
import { toggleRecurringBillStatusAction } from "@/actions/recurring-bills-actions";

type ToggleRecurringBillButtonProps = {
  recurringBillId: string;
  recurringBillDescription: string;
  active: boolean;
};

export function ToggleRecurringBillButton({
  recurringBillId,
  recurringBillDescription,
  active,
}: ToggleRecurringBillButtonProps) {
  const router = useRouter();

  const [isOpen, setIsOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const actionLabel = active ? "Inativar" : "Ativar";
  const fullActionLabel = active ? "Inativar conta fixa" : "Reativar conta fixa";

  const description = active
    ? "Essa conta fixa não será usada para novos lançamentos, mas continuará no histórico."
    : "Essa conta fixa voltará a aparecer como opção ativa.";

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  function closeModal() {
    if (isPending) return;
    setIsOpen(false);
  }

  function handleConfirm() {
    if (isPending) return;

    setErrorMessage(null);

    startTransition(async () => {
      try {
        const result = await toggleRecurringBillStatusAction(recurringBillId);

        if (!result?.success) {
          setErrorMessage("Não foi possível atualizar essa conta fixa.");
          return;
        }

        setIsOpen(false);
        router.refresh();
      } catch (error) {
        console.error(error);
        setErrorMessage("Erro ao atualizar a conta fixa.");
      }
    });
  }

  const portalRoot = typeof document === "undefined" ? null : document.body;

  const modal =
    isOpen && portalRoot
      ? createPortal(
          <div className="account-confirmation-modal">
            <button
              type="button"
              className="account-confirmation-modal__backdrop"
              onClick={closeModal}
              aria-label="Fechar confirmação"
            />

            <div
              className="account-confirmation-modal__card"
              role="dialog"
              aria-modal="true"
            >
              <div className="account-confirmation-modal__top">
                <div
                  className={
                    active
                      ? "account-confirmation-modal__icon account-confirmation-modal__icon--warning"
                      : "account-confirmation-modal__icon account-confirmation-modal__icon--success"
                  }
                >
                  {active ? (
                    <AlertTriangle className="h-6 w-6" />
                  ) : (
                    <Power className="h-6 w-6" />
                  )}
                </div>

                <button
                  type="button"
                  onClick={closeModal}
                  className="account-confirmation-modal__close"
                  aria-label="Fechar confirmação"
                  disabled={isPending}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <h3>{fullActionLabel}?</h3>

              <p>
                Você está prestes a {actionLabel.toLowerCase()}{" "}
                <strong>{recurringBillDescription}</strong>. {description}
              </p>

              {errorMessage && (
                <div className="mt-4 rounded-2xl border border-red-500/20 bg-red-500/10 p-3 text-sm font-bold text-red-300">
                  {errorMessage}
                </div>
              )}

              <div className="account-confirmation-modal__actions">
                <button
                  type="button"
                  onClick={closeModal}
                  className="account-confirmation-modal__cancel"
                  disabled={isPending}
                >
                  Cancelar
                </button>

                <button
                  type="button"
                  onClick={handleConfirm}
                  disabled={isPending}
                  className={
                    active
                      ? "account-confirmation-modal__confirm account-confirmation-modal__confirm--warning"
                      : "account-confirmation-modal__confirm account-confirmation-modal__confirm--success"
                  }
                >
                  {isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : active ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Power className="h-4 w-4" />
                  )}

                  {isPending ? "Atualizando..." : actionLabel}
                </button>
              </div>
            </div>
          </div>,
          portalRoot,
        )
      : null;

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={
          active
            ? "account-toggle-button account-toggle-button--inactive-action"
            : "account-toggle-button account-toggle-button--active-action"
        }
      >
        {active ? <EyeOff className="h-4 w-4" /> : <Power className="h-4 w-4" />}

        <span className="account-toggle-button__desktop-label">
          {actionLabel}
        </span>

        <span className="account-toggle-button__mobile-label">
          {fullActionLabel}
        </span>
      </button>

      {modal}
    </>
  );
}
