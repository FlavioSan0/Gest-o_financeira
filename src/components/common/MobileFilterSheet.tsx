"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { Filter, RotateCcw, X } from "lucide-react";

type MobileFilterSheetProps = {
  isOpen: boolean;
  title: string;
  eyebrow?: string;
  action: string;
  clearHref: string;
  children: ReactNode;
  onClose: () => void;
  applyLabel?: string;
  clearLabel?: string;
};

export function MobileFilterSheet({
  isOpen,
  title,
  eyebrow = "Filtros",
  action,
  clearHref,
  children,
  onClose,
  applyLabel = "Aplicar",
  clearLabel = "Limpar",
}: MobileFilterSheetProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="mobile-filter-sheet" role="dialog" aria-modal="true">
      <button
        type="button"
        className="mobile-filter-sheet__backdrop"
        onClick={onClose}
        aria-label="Fechar filtros"
      />

      <form action={action} className="mobile-filter-sheet__panel">
        <div className="mobile-filter-sheet__handle" />

        <header className="mobile-filter-sheet__header">
          <div>
            <p className="mobile-eyebrow">{eyebrow}</p>
            <h3>{title}</h3>
          </div>

          <button type="button" onClick={onClose} aria-label="Fechar filtros">
            <X className="h-4 w-4" />
          </button>
        </header>

        <div className="mobile-filter-sheet__body">{children}</div>

        <footer className="mobile-filter-sheet__actions">
          <Link href={clearHref}>
            <RotateCcw className="h-4 w-4" />
            {clearLabel}
          </Link>

          <button type="submit">
            <Filter className="h-4 w-4" />
            {applyLabel}
          </button>
        </footer>
      </form>
    </div>
  );
}
