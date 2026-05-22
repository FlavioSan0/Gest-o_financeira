"use client";

import { useEffect, useState, useTransition } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { AlertTriangle, EyeOff, Loader2, Power, X } from "lucide-react";
import { toggleCategoryStatusAction } from "@/actions/categories-actions";

type ToggleCategoryButtonProps = {
  categoryId: string;
  categoryName: string;
  active: boolean;
};

export function ToggleCategoryButton({
  categoryId,
  categoryName,
  active,
}: ToggleCategoryButtonProps) {
  const router = useRouter();

  const [isOpen, setIsOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const actionLabel = active ? "Inativar" : "Ativar";
  const fullActionLabel = active ? "Inativar categoria" : "Reativar categoria";

  const description = active
    ? "Essa categoria não aparecerá mais nos novos lançamentos, mas continuará preservada no histórico."
    : "Essa categoria voltará a aparecer como opção nos novos lançamentos.";

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
        const result = await toggleCategoryStatusAction(categoryId);

        if (!result?.success) {
          setErrorMessage("Não foi possível atualizar essa categoria.");
          return;
        }

        setIsOpen(false);
        router.refresh();
      } catch (error) {
        console.error(error);
        setErrorMessage("Erro ao atualizar a categoria. Tente novamente.");
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
              aria-labelledby={`category-modal-title-${categoryId}`}
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

              <h3 id={`category-modal-title-${categoryId}`}>
                {fullActionLabel}?
              </h3>

              <p>
                Você está prestes a {actionLabel.toLowerCase()} a categoria{" "}
                <strong>{categoryName}</strong>. {description}
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
          portalRoot,
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
