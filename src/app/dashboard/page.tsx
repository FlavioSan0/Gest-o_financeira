import { AppShell } from "@/components/layout/AppShell";
import { AutoRefresh } from "@/components/common/AutoRefresh";
import { DashboardDesktop } from "@/components/dashboard/desktop/DashboardDesktop";
import { DashboardMobile } from "@/components/dashboard/mobile/DashboardMobile";
import { getDashboardData } from "@/services/dashboard-service";

type DashboardPageProps = {
  searchParams?: Promise<{
    month?: string;
    year?: string;
  }>;
};

export default async function DashboardPage({
  searchParams,
}: DashboardPageProps) {
  const query = await searchParams;
  const dashboard = await getDashboardData({
    month: query?.month,
    year: query?.year,
  });

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
