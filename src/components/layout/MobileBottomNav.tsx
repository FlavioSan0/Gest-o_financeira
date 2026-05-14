"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CreditCard, Home, LayoutGrid, Plus, ReceiptText } from "lucide-react";

function isActivePath(pathname: string, href: string) {
  if (href === "/") {
    return pathname === "/";
  }

  return pathname.startsWith(href);
}

export function MobileBottomNav() {
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
          isActivePath(pathname, "/cartoes")
            ? "mobile-bottom-nav__item mobile-bottom-nav__item--active"
            : "mobile-bottom-nav__item"
        }
      >
        <CreditCard className="mobile-bottom-nav__icon" />
        <span>Cartões</span>
      </Link>

      <Link
        href="/contas"
        className={
          isActivePath(pathname, "/contas") ||
          isActivePath(pathname, "/categorias") ||
          isActivePath(pathname, "/metas") ||
          isActivePath(pathname, "/relatorios") ||
          isActivePath(pathname, "/configuracoes")
            ? "mobile-bottom-nav__item mobile-bottom-nav__item--active"
            : "mobile-bottom-nav__item"
        }
      >
        <LayoutGrid className="mobile-bottom-nav__icon" />
        <span>Menu</span>
      </Link>
    </nav>
  );
}