"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CreditCard, Home, LayoutGrid, Plus, ReceiptText } from "lucide-react";

type MobileBottomNavProps = {
  onOpenMenu: () => void;
};

function isActivePath(pathname: string, href: string) {
  if (href === "/") {
    return pathname === "/";
  }

  return pathname.startsWith(href);
}

function isMenuActive(pathname: string) {
  return (
    pathname.startsWith("/contas") ||
    pathname.startsWith("/categorias") ||
    pathname.startsWith("/metas") ||
    pathname.startsWith("/relatorios") ||
    pathname.startsWith("/configuracoes") ||
    pathname.startsWith("/cartoes/faturas")
  );
}

export function MobileBottomNav({ onOpenMenu }: MobileBottomNavProps) {
  const pathname = usePathname();

  return (
    <nav className="mobile-bottom-nav" aria-label="Navegação mobile">
      <Link
        href="/"
        className={
          isActivePath(pathname, "/")
            ? "mobile-bottom-nav__item mobile-bottom-nav__item--active"
            : "mobile-bottom-nav__item"
        }
      >
        <Home className="mobile-bottom-nav__icon" />
        <span>Início</span>
      </Link>

      <Link
        href="/lancamentos"
        className={
          isActivePath(pathname, "/lancamentos")
            ? "mobile-bottom-nav__item mobile-bottom-nav__item--active"
            : "mobile-bottom-nav__item"
        }
      >
        <ReceiptText className="mobile-bottom-nav__icon" />
        <span>Transações</span>
      </Link>

      <Link
        href="/lancamentos/novo"
        className="mobile-bottom-nav__main-action"
        aria-label="Novo lançamento"
      >
        <Plus className="mobile-bottom-nav__main-icon" />
      </Link>

      <Link
        href="/cartoes"
        className={
          isActivePath(pathname, "/cartoes") &&
          !pathname.startsWith("/cartoes/faturas")
            ? "mobile-bottom-nav__item mobile-bottom-nav__item--active"
            : "mobile-bottom-nav__item"
        }
      >
        <CreditCard className="mobile-bottom-nav__icon" />
        <span>Cartões</span>
      </Link>

      <button
        type="button"
        onClick={onOpenMenu}
        className={
          isMenuActive(pathname)
            ? "mobile-bottom-nav__item mobile-bottom-nav__item--active"
            : "mobile-bottom-nav__item"
        }
        aria-label="Abrir menu"
      >
        <LayoutGrid className="mobile-bottom-nav__icon" />
        <span>Menu</span>
      </button>
    </nav>
  );
}