import Link from "next/link";
import { Bell, LogOut, Plus, Search } from "lucide-react";
import { logoutAction } from "@/actions/auth-actions";
import { getCurrentSession } from "@/lib/session";

export async function Topbar() {
  const session = await getCurrentSession();

  const firstName = session?.name?.split(" ")[0] ?? "Usuário";

  const initials = session?.name
    ? session.name
        .split(" ")
        .map((part: string) => part[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "US";

  return (
    <header className="topbar">
      <div className="min-w-0">
        <p className="text-sm font-medium app-faint-text">Olá, {firstName}</p>

        <h1 className="topbar-title text-white">Dashboard financeiro</h1>
      </div>

      <div className="topbar-actions">
        <button className="hidden h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-white transition hover:bg-white hover:text-black md:flex">
          <Search className="h-4 w-4" />
        </button>

        <button className="hidden h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-white transition hover:bg-white hover:text-black md:flex">
          <Bell className="h-4 w-4" />
        </button>

        <Link
          href="/lancamentos/novo"
          className="app-button-primary topbar-new-button"
        >
          <Plus className="h-4 w-4" />
          Novo lançamento
        </Link>

        <div className="user-pill">
          <div className="user-avatar">{initials}</div>

          <div className="hidden md:block">
            <p className="text-xs font-bold text-white">
              {session?.name ?? "Usuário"}
            </p>

            <p className="text-[11px] app-faint-text">
              {session?.email ?? "Sessão ativa"}
            </p>
          </div>
        </div>

        <form action={logoutAction}>
          <button
            type="submit"
            className="hidden h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-white transition hover:bg-white hover:text-black md:flex"
            title="Sair"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </form>
      </div>
    </header>
  );
}