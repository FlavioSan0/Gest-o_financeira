"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Wallet } from "lucide-react";
import { navigationItems } from "@/data/navigation";

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sidebar">
      <div className="sidebar-inner">
        <div className="sidebar-logo">
          <div className="app-icon-box h-11 w-11">
            <Wallet className="h-5 w-5" />
          </div>

          <div>
            <strong className="block text-base font-black tracking-[-0.03em] text-white">
              Finanças
            </strong>

            <span className="block text-xs app-faint-text">
              Controle do casal
            </span>
          </div>
        </div>

        <nav className="sidebar-nav">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={
                  isActive
                    ? "sidebar-link sidebar-link-active"
                    : "sidebar-link"
                }
              >
                <Icon className="h-4 w-4" />
                <span className="text-sm font-bold">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <div className="rounded-3xl border border-white/10 bg-white/4 p-4">
            <p className="text-sm font-bold text-white">Plano do mês</p>

            <p className="mt-2 text-xs leading-5 app-faint-text">
              Comece cadastrando suas contas fixas e principais categorias.
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}