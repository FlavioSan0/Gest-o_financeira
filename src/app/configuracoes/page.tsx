import { AppShell } from "@/components/layout/AppShell";
import { UserSettingsView } from "@/components/settings/UserSettingsView";
import { getSettingsPageData } from "@/services/settings-service";

type ConfiguracoesPageProps = {
  searchParams: Promise<{
    passwordError?: string;
  }>;
};

export default async function ConfiguracoesPage({
  searchParams,
}: ConfiguracoesPageProps) {
  const [params, data] = await Promise.all([
    searchParams,
    getSettingsPageData(),
  ]);

  return (
    <AppShell>
      <UserSettingsView data={data} passwordError={params.passwordError} />
    </AppShell>
  );
}
