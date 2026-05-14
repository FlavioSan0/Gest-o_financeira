import { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

type AppShellProps = {
  children: ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  return (
    <main className="app-shell">
      <div className="dashboard-background-effects">
        <div className="dashboard-orb dashboard-orb-left" />
        <div className="dashboard-orb dashboard-orb-right" />
        <div className="dashboard-orb dashboard-orb-bottom" />
      </div>

      <div className="app-layout">
        <Sidebar />

        <div className="app-main">
          <section className="app-page">
            <Topbar />

            <div className="app-content">{children}</div>
          </section>
        </div>
      </div>
    </main>
  );
}