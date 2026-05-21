import { LogOut, ShieldCheck, UsersRound, WalletCards } from "lucide-react";
import { logoutAction } from "@/actions/auth-actions";
import { ChangePasswordForm } from "@/components/settings/ChangePasswordForm";
import type { SettingsPageData } from "@/services/settings-service";

type UserSettingsViewProps = {
  data: SettingsPageData;
  passwordError?: string;
};

function InfoCard({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail?: string;
}) {
  return (
    <article className="rounded-3xl border border-white/10 bg-white/[0.035] p-5">
      <p className="text-xs font-bold uppercase tracking-[0.18em] app-faint-text">
        {label}
      </p>
      <strong className="mt-2 block text-lg font-black text-white">{value}</strong>
      {detail ? (
        <span className="mt-1 block text-xs app-muted-text">{detail}</span>
      ) : null}
    </article>
  );
}

export function UserSettingsView({
  data,
  passwordError,
}: UserSettingsViewProps) {
  return (
    <div className="app-container">
      <div className="desktop-only">
        <div className="grid gap-6">
          <header className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <p className="text-sm font-medium app-faint-text">
                Conta e acesso
              </p>
              <h2 className="mt-1 text-3xl font-black tracking-[-0.04em] text-white">
                Configuracoes
              </h2>
              <p className="mt-2 text-sm app-muted-text">
                Perfil, familia, seguranca e informacoes do app.
              </p>
            </div>

            <form action={logoutAction}>
              <button type="submit" className="app-button-secondary">
                <LogOut className="h-4 w-4" />
                Sair
              </button>
            </form>
          </header>

          <section className="grid gap-4 xl:grid-cols-4">
            <InfoCard label="Usuario" value={data.user.name} detail={data.user.email} />
            <InfoCard label="Funcao" value={data.user.role} detail="Na familia atual" />
            <InfoCard label="Familia" value={data.family.name} detail={`${data.family.members.length} membros`} />
            <InfoCard
              label="Ultimo login"
              value={data.user.lastLoginAt ?? "Nao informado"}
              detail="Horario local"
            />
          </section>

          <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
            <section className="app-card p-5">
              <div className="mb-5 flex items-center gap-4">
                <div className="app-icon-box h-11 w-11">
                  <UsersRound className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] app-faint-text">
                    Familia
                  </p>
                  <h3 className="mt-1 text-lg font-black text-white">
                    Membros vinculados
                  </h3>
                </div>
              </div>

              <div className="grid gap-3">
                {data.family.members.map((member) => (
                  <article
                    key={member.id}
                    className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4"
                  >
                    <div className="min-w-0">
                      <h4 className="truncate text-sm font-black text-white">
                        {member.name}
                      </h4>
                      <p className="mt-1 truncate text-xs app-muted-text">
                        {member.email}
                      </p>
                    </div>
                    <span className="rounded-full border border-cyan-400/25 bg-cyan-400/10 px-3 py-1 text-xs font-black text-cyan-100">
                      {member.role}
                    </span>
                  </article>
                ))}
              </div>
            </section>

            <div className="grid gap-6">
              <ChangePasswordForm error={passwordError} />

              <section className="app-card p-5">
                <div className="flex items-start gap-4">
                  <div className="app-icon-box h-11 w-11">
                    <WalletCards className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.18em] app-faint-text">
                      App
                    </p>
                    <h3 className="mt-1 text-lg font-black text-white">
                      {data.app.name}
                    </h3>
                    <p className="mt-2 text-sm app-muted-text">{data.app.mode}</p>
                    <p className="mt-1 text-xs app-faint-text">
                      Sessao: {data.app.session}
                    </p>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>

      <div className="mobile-only">
        <div className="grid gap-4 pb-24">
          <header className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
            <p className="text-xs font-bold uppercase tracking-[0.18em] app-faint-text">
              Conta
            </p>
            <h2 className="mt-2 text-2xl font-black tracking-[-0.04em] text-white">
              {data.user.name}
            </h2>
            <p className="mt-1 text-sm app-muted-text">{data.user.email}</p>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <InfoCard label="Funcao" value={data.user.role} />
              <InfoCard label="Familia" value={data.family.name} />
            </div>
          </header>

          <section className="app-card p-5">
            <div className="mb-4 flex items-center gap-3">
              <ShieldCheck className="h-5 w-5 text-cyan-200" />
              <h3 className="text-lg font-black text-white">Acesso</h3>
            </div>
            <div className="grid gap-3 text-sm">
              <div className="flex justify-between gap-3">
                <span className="app-muted-text">Ultimo login</span>
                <strong className="text-right text-white">
                  {data.user.lastLoginAt ?? "Nao informado"}
                </strong>
              </div>
              <div className="flex justify-between gap-3">
                <span className="app-muted-text">Sessao</span>
                <strong className="text-right text-white">{data.app.session}</strong>
              </div>
            </div>
          </section>

          <section className="app-card p-5">
            <h3 className="mb-4 text-lg font-black text-white">Membros</h3>
            <div className="grid gap-3">
              {data.family.members.map((member) => (
                <article
                  key={member.id}
                  className="rounded-2xl border border-white/10 bg-white/[0.03] p-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <strong className="truncate text-white">{member.name}</strong>
                    <span className="rounded-full border border-cyan-400/25 bg-cyan-400/10 px-3 py-1 text-[0.68rem] font-black text-cyan-100">
                      {member.role}
                    </span>
                  </div>
                  <p className="mt-1 truncate text-xs app-muted-text">
                    {member.email}
                  </p>
                </article>
              ))}
            </div>
          </section>

          <ChangePasswordForm error={passwordError} />

          <section className="app-card p-5">
            <p className="text-xs font-bold uppercase tracking-[0.18em] app-faint-text">
              App
            </p>
            <h3 className="mt-1 text-lg font-black text-white">
              {data.app.name}
            </h3>
            <p className="mt-1 text-sm app-muted-text">{data.app.mode}</p>
          </section>

          <form action={logoutAction}>
            <button type="submit" className="app-button-secondary w-full">
              <LogOut className="h-4 w-4" />
              Sair
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
