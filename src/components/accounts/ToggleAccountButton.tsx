"use client";

import { useEffect, useState, useTransition } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { AlertTriangle, EyeOff, Loader2, Power, X } from "lucide-react";
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
  const router = useRouter();

  const [isOpen, setIsOpen] = useState(false);
  const [isBrowser, setIsBrowser] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const actionLabel = active ? "Inativar" : "Ativar";
  const fullActionLabel = active ? "Inativar conta" : "Reativar conta";

  const description = active
    ? "Essa conta não aparecerá mais em novos lançamentos, mas continuará preservada no histórico."
    : "Essa conta voltará a aparecer como opção nos novos lançamentos.";

  useEffect(() => {
    setIsBrowser(true);
  }, []);

  useEffect(() => {
    if (!isOpen) {
      document.body.style.overflow = "";
      return;
    }

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  function openModal() {
    setErrorMessage(null);
    setIsOpen(true);
  }

  function closeModal() {
    if (isPending) return;
    setIsOpen(false);
  }

  function handleConfirm() {
    if (isPending) return;

    setErrorMessage(null);

    startTransition(async () => {
      try {
        console.log("[ToggleAccountButton] Enviando conta:", accountId);

        const result = await toggleAccountStatusAction(accountId);

        console.log("[ToggleAccountButton] Resultado:", result);

        if (!result?.success) {
          setErrorMessage("Não foi possível atualizar essa conta.");
          return;
        }

        setIsOpen(false);
        router.refresh();
      } catch (error) {
        console.error("[ToggleAccountButton] Erro:", error);
        setErrorMessage("Erro ao atualizar a conta. Tente novamente.");
      }
    });
  }

  const modal =
    isOpen && isBrowser
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
              aria-labelledby={`account-modal-title-${accountId}`}
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

              <h3 id={`account-modal-title-${accountId}`}>
                {fullActionLabel}?
              </h3>

              <p>
                Você está prestes a {actionLabel.toLowerCase()} a conta{" "}
                <strong>{accountName}</strong>. {description}
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
                  onTouchEnd={(event) => {
                    event.preventDefault();
                    handleConfirm();
                  }}
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
          document.body,
        )
      : null;

  return (
    <>
      <button
        type="button"
        onClick={openModal}
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