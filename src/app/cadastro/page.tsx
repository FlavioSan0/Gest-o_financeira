import Link from "next/link";
import { connection } from "next/server";
import { KeyRound, ShieldCheck, UserPlus } from "lucide-react";
import { registerAction } from "@/actions/registration-actions";

type RegisterPageProps = {
  searchParams: Promise<{
    error?: string;
  }>;
};

function getErrorMessage(error?: string) {
  if (error === "name") {
    return "Informe seu nome para criar a conta.";
  }

  if (error === "email") {
    return "Digite um e-mail válido.";
  }

  if (error === "password") {
    return "A senha precisa ter pelo menos 8 caracteres.";
  }

  if (error === "password-confirmation") {
    return "A confirmação precisa ser igual à senha.";
  }

  if (error === "invalid") {
    return "Não foi possível criar a conta com os dados informados.";
  }

  return null;
}

export default async function RegisterPage({ searchParams }: RegisterPageProps) {
  await connection();

  const params = await searchParams;
  const errorMessage = getErrorMessage(params.error);

  return (
    <main className="min-h-screen bg-[#020617] text-white">
      <div className="flex min-h-screen items-center justify-center px-4 py-8">
        <section className="w-full max-w-md rounded-[2rem] border border-white/10 bg-white/[0.04] p-5 shadow-2xl shadow-black/50 backdrop-blur-2xl sm:p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-cyan-300 text-slate-950 shadow-[0_0_35px_rgba(103,232,249,0.16)]">
              <UserPlus className="h-6 w-6" />
            </div>

            <div>
              <p className="text-sm text-white/45">Cadastro controlado</p>
              <h1 className="text-2xl font-black tracking-[-0.04em]">
                Criar conta
              </h1>
            </div>
          </div>

          <p className="mt-5 text-sm leading-6 text-white/55">
            Entre com seus dados e o código de convite para acessar o Quebrei.
          </p>

          {errorMessage ? (
            <div className="mt-5 rounded-3xl border border-red-500/20 bg-red-500/10 p-4 text-sm font-bold text-red-300">
              {errorMessage}
            </div>
          ) : null}

          <form action={registerAction} className="mt-5 grid gap-3.5">
            <div>
              <label className="mb-2 block text-sm font-bold text-white">
                Nome
              </label>

              <input
                required
                type="text"
                name="name"
                placeholder="Seu nome"
                className="finance-input"
                autoComplete="name"
              />
            </div>

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

            <div className="grid gap-3.5 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-bold text-white">
                  Senha
                </label>

                <input
                  required
                  minLength={8}
                  type="password"
                  name="password"
                  placeholder="Mín. 8 caracteres"
                  className="finance-input"
                  autoComplete="new-password"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-white">
                  Confirmar
                </label>

                <input
                  required
                  minLength={8}
                  type="password"
                  name="confirmPassword"
                  placeholder="Repita a senha"
                  className="finance-input"
                  autoComplete="new-password"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 flex items-center gap-2 text-sm font-bold text-white">
                <KeyRound className="h-4 w-4 text-cyan-200" />
                Código de convite
              </label>

              <input
                required
                type="password"
                name="inviteCode"
                placeholder="Código recebido"
                className="finance-input"
                autoComplete="off"
              />
            </div>

            <button type="submit" className="app-button-primary mt-2 w-full">
              Criar conta
            </button>
          </form>

          <div className="mt-5 flex items-start gap-3 rounded-3xl border border-white/10 bg-black/25 p-4">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" />
            <p className="text-xs leading-5 text-white/45">
              O cadastro é validado no servidor e só funciona com convite.
            </p>
          </div>

          <Link
            href="/login"
            className="mt-5 block text-center text-sm font-bold text-white/55 transition hover:text-white"
          >
            Já tenho conta
          </Link>
        </section>
      </div>
    </main>
  );
}
