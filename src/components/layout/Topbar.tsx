import Link from "next/link";
import { Bell, Plus, Search } from "lucide-react";

export function Topbar() {
  return (
    <header className="topbar">
      <div>
        <p className="text-sm font-medium app-faint-text">Visão geral</p>
        <h1 className="topbar-title text-white">Dashboard financeiro</h1>
      </div>

      <div className="topbar-actions">
        <button className="hidden h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-white transition hover:bg-white hover:text-black md:flex">
          <Search className="h-4 w-4" />
        </button>

        <button className="hidden h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-white transition hover:bg-white hover:text-black md:flex">
          <Bell className="h-4 w-4" />
        </button>

        <Link href="/lancamentos/novo" className="app-button-primary">
          <Plus className="h-4 w-4" />
          Novo lançamento
        </Link>

        <div className="user-pill">
          <div className="user-avatar">FO</div>

          <div className="hidden md:block">
            <p className="text-xs font-bold text-white">Flávio</p>
            <p className="text-[11px] app-faint-text">Administrador</p>
          </div>
        </div>
      </div>
    </header>
  );
}