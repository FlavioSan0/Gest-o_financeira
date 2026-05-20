"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  CreditCard,
  FolderCog,
  Landmark,
  LayoutGrid,
  PiggyBank,
  Settings,
  Tags,
  X,
} from "lucide-react";

type MobileMenuSheetProps = {
  isOpen: boolean;
  onClose: () => void;
};

const menuItems = [
  {
    href: "/contas",
    label: "Contas",
    description: "Bancos, carteiras e saldos",
    icon: Landmark,
  },
  {
    href: "/categorias",
    label: "Categorias",
    description: "Entradas, saídas e organização",
    icon: Tags,
  },
  {
    href: "/cartoes/faturas",
    label: "Faturas",
    description: "Controle e pagamento de faturas",
    icon: CreditCard,
  },
  {
    href: "/metas",
    label: "Metas",
    description: "Reservas e objetivos financeiros",
    icon: PiggyBank,
  },
  {
    href: "/relatorios",
    label: "Relatórios",
    description: "Análises e visão financeira",
    icon: BarChart3,
  },
  {
    href: "/configuracoes",
    label: "Configurações",
    description: "Preferências e ajustes do sistema",
    icon: Settings,
  },
];

function isActivePath(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function MobileMenuSheet({ isOpen, onClose }: MobileMenuSheetProps) {
  const pathname = usePathname();

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

  if (!isOpen) {
    return null;
  }

  const portalRoot =
    typeof document === "undefined" ? null : document.body;

  if (!portalRoot) {
    return null;
  }

  return createPortal(
    <div className="mobile-menu-sheet">
      <button
        type="button"
        className="mobile-menu-sheet__backdrop"
        onClick={onClose}
        aria-label="Fechar menu"
      />

      <section
        className="mobile-menu-sheet__panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="mobile-menu-title"
      >
        <div className="mobile-menu-sheet__handle" />

        <header className="mobile-menu-sheet__header">
          <div className="mobile-menu-sheet__header-icon">
            <LayoutGrid className="h-5 w-5" />
          </div>

          <div>
            <p className="mobile-eyebrow">Menu do app</p>
            <h2 id="mobile-menu-title">Organização</h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="mobile-menu-sheet__close"
            aria-label="Fechar menu"
          >
            <X className="h-4 w-4" />
          </button>
        </header>

        <div className="mobile-menu-sheet__grid">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActivePath(pathname, item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                prefetch
                onClick={onClose}
                className={
                  active
                    ? "mobile-menu-sheet__item mobile-menu-sheet__item--active"
                    : "mobile-menu-sheet__item"
                }
              >
                <div className="mobile-menu-sheet__item-icon">
                  <Icon className="h-5 w-5" />
                </div>

                <div>
                  <strong>{item.label}</strong>
                  <span>{item.description}</span>
                </div>
              </Link>
            );
          })}
        </div>

        <div className="mobile-menu-sheet__footer">
          <div>
            <FolderCog className="h-4 w-4" />
          </div>

          <p>
            As funções extras ficam aqui para manter a barra principal limpa e
            rápida.
          </p>
        </div>
      </section>
    </div>,
    portalRoot,
  );
}
