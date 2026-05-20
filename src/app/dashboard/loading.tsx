export default function LoadingDashboard() {
  return (
    <main className="app-container grid gap-4">
      <section className="app-card h-44 animate-pulse p-6" />
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="app-card h-36 animate-pulse" />
        ))}
      </section>
      <section className="grid gap-4 xl:grid-cols-2">
        <div className="app-card h-80 animate-pulse" />
        <div className="app-card h-80 animate-pulse" />
      </section>
    </main>
  );
}
