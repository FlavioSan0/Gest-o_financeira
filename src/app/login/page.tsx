import { Wallet } from "lucide-react";
import { loginAction } from "@/actions/auth-actions";

type LoginPageProps = {
  searchParams: Promise<{
    error?: string;
    message?: string;
    next?: string;
  }>;
};

function getErrorMessage(error?: string) {
  if (error === "invalid") {
    return "E-mail ou senha inválidos.";
  }

  return null;
}

function getSuccessMessage(message?: string) {
  if (message === "password-updated") {
    return "Senha alterada com sucesso. Entre novamente.";
  }

  return null;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const errorMessage = getErrorMessage(params.error);
  const successMessage = getSuccessMessage(params.message);

  return (
    <main className="min-h-screen bg-[#020617] text-white">
      <div className="flex min-h-screen items-center justify-center px-4 py-10">
        <section className="w-full max-w-md rounded-4xl border border-white/10 bg-white/[0.04] p-6 shadow-2xl shadow-black/50 backdrop-blur-2xl">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-black shadow-[0_0_35px_rgba(255,255,255,0.14)]">
              <Wallet className="h-6 w-6" />
            </div>

            <div>
              <p className="text-sm text-white/45">Financas do casal</p>
              <h1 className="text-2xl font-black tracking-[-0.04em]">
                Entrar no app
              </h1>
            </div>
          </div>

          <p className="mt-6 text-sm leading-6 text-white/55">
            Acesse sua area financeira para registrar lancamentos, acompanhar
            contas, cartoes e faturas com seguranca.
          </p>

          {errorMessage ? (
            <div className="mt-5 rounded-3xl border border-red-500/20 bg-red-500/10 p-4 text-sm font-bold text-red-400">
              {errorMessage}
            </div>
          ) : null}

          {successMessage ? (
            <div className="mt-5 rounded-3xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm font-bold text-emerald-300">
              {successMessage}
            </div>
          ) : null}

          <form action={loginAction} className="mt-6 grid gap-4">
            <input type="hidden" name="next" value={params.next ?? "/"} />

            <div>
              <label className="mb-2 block text-sm font-bold text-white">
                E-mail
              </label>

              <input
                required
                type="email"
                name="email"
                placeholder="voce@email.com"
                className="finance-input"
                autoComplete="email"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-white">
                Senha
              </label>

              <input
                required
                type="password"
                name="password"
                placeholder="Digite sua senha"
                className="finance-input"
                autoComplete="current-password"
              />
            </div>

            <button type="submit" className="app-button-primary mt-2 w-full">
              Entrar
            </button>
          </form>

          <div className="mt-6 rounded-3xl border border-white/10 bg-black/25 p-4">
            <p className="text-xs font-bold text-white/45">
              Seguranca aplicada
            </p>

            <p className="mt-1 text-xs leading-5 text-white/40">
              Sessao protegida por cookie HTTP-only. Os lancamentos sao
              vinculados automaticamente ao usuario logado.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
