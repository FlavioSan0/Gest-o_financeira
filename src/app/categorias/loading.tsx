export default function LoadingCategories() {
  return (
    <main className="app-container grid gap-4">
      <section className="app-card h-28 animate-pulse" />
      <section className="grid gap-4 xl:grid-cols-[0.72fr_1.28fr]">
        <div className="app-card h-96 animate-pulse" />
        <div className="app-card h-96 animate-pulse" />
      </section>
    </main>
  );
}
