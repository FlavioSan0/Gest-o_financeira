export default function LoadingTransactions() {
  return (
    <main className="app-container grid gap-4">
      <section className="app-card h-32 animate-pulse" />
      <section className="app-card h-28 animate-pulse" />
      <section className="grid gap-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="app-card h-20 animate-pulse" />
        ))}
      </section>
    </main>
  );
}
