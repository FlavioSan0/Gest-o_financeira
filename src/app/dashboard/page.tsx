import { AppShell } from "@/components/layout/AppShell";
import { AutoRefresh } from "@/components/common/AutoRefresh";
import { DashboardDesktop } from "@/components/dashboard/desktop/DashboardDesktop";
import { DashboardMobile } from "@/components/dashboard/mobile/DashboardMobile";
import { getDashboardData } from "@/services/dashboard-service";

export default async function DashboardPage() {
  const dashboard = await getDashboardData();

  return (
    <AppShell>
      <div className="app-container mb-4">
        <AutoRefresh intervalMs={30000} showStatus />
      </div>

      <div className="desktop-only">
        <DashboardDesktop dashboard={dashboard} />
      </div>

      <div className="mobile-only">
        <DashboardMobile dashboard={dashboard} />
      </div>
    </AppShell>
  );
}
