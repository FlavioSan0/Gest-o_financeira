export default function ConfiguracoesPage() {
  return (
    <main className="min-h-screen bg-[#020617] px-4 py-6 text-white md:px-8">
      <section className="mx-auto max-w-5xl rounded-3xl border border-white/10 bg-white/[0.03] p-6 shadow-2xl shadow-black/20">
        <p className="text-sm font-medium uppercase tracking-[0.24em] text-cyan-300">
          Configurações
        </p>

        <h1 className="mt-3 text-2xl font-bold tracking-tight md:text-3xl">
          Configurações do sistema
        </h1>

        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">
          Esta área será usada para preferências, família, segurança e ajustes do aplicativo.
        </p>
      </section>
    </main>
  );
}