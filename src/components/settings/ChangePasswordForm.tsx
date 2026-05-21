import { LockKeyhole } from "lucide-react";
import { changePasswordAction } from "@/actions/settings-actions";

type ChangePasswordFormProps = {
  error?: string;
};

function getErrorMessage(error?: string) {
  if (error === "current") return "Senha atual invalida.";
  if (error === "short") {
    return "A nova senha precisa ter no minimo 8 caracteres.";
  }
  if (error === "mismatch") return "A confirmacao precisa ser igual a nova senha.";
  if (error === "missing") return "Preencha todos os campos de senha.";

  return null;
}

export function ChangePasswordForm({ error }: ChangePasswordFormProps) {
  const errorMessage = getErrorMessage(error);

  return (
    <form action={changePasswordAction} className="app-card p-5">
      <div className="flex items-start gap-4">
        <div className="app-icon-box h-11 w-11">
          <LockKeyhole className="h-5 w-5" />
        </div>

        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] app-faint-text">
            Seguranca
          </p>
          <h3 className="mt-1 text-lg font-black text-white">Alterar senha</h3>
        </div>
      </div>

      {errorMessage ? (
        <div className="mt-4 rounded-2xl border border-rose-400/20 bg-rose-400/10 p-3 text-sm font-bold text-rose-100">
          {errorMessage}
        </div>
      ) : null}

      <div className="mt-5 grid gap-4">
        <div>
          <label className="mb-2 block text-sm font-bold text-white">
            Senha atual
          </label>
          <input
            required
            type="password"
            name="currentPassword"
            className="finance-input"
            autoComplete="current-password"
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-bold text-white">
              Nova senha
            </label>
            <input
              required
              minLength={8}
              type="password"
              name="newPassword"
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
              className="finance-input"
              autoComplete="new-password"
            />
          </div>
        </div>

        <button type="submit" className="app-button-primary w-full">
          Atualizar senha
        </button>

        <p className="text-xs leading-5 app-faint-text">
          Por seguranca, voce sera redirecionado para entrar novamente apos a
          troca.
        </p>
      </div>
    </form>
  );
}
