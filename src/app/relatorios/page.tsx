import { AppShell } from "@/components/layout/AppShell";
import { ReportsView } from "@/components/reports/ReportsView";
import {
  getReportsData,
  type ReportStatusFilter,
  type ReportsFilters,
  type ReportTypeFilter,
} from "@/services/reports-service";

type ReportsPageProps = {
  searchParams: Promise<{
    month?: string;
    year?: string;
    responsibleId?: string;
    categoryId?: string;
    type?: string;
    status?: string;
  }>;
};

function normalizeType(value?: string): ReportTypeFilter {
  if (value === "INCOME" || value === "EXPENSE") {
    return value;
  }

  return "ALL";
}

function normalizeStatus(value?: string): ReportStatusFilter {
  if (value === "PAID" || value === "PENDING") {
    return value;
  }

  return "ALL";
}

function normalizeId(value?: string) {
  if (!value || value.trim() === "") {
    return "ALL";
  }

  return value;
}

function normalizeMonth(value?: string) {
  if (/^(0[1-9]|1[0-2])$/.test(value ?? "")) {
    return value!;
  }

  return String(new Date().getMonth() + 1).padStart(2, "0");
}

function normalizeYear(value?: string) {
  if (/^\d{4}$/.test(value ?? "")) {
    return value!;
  }

  return String(new Date().getFullYear());
}

export default async function ReportsPage({ searchParams }: ReportsPageProps) {
  const params = await searchParams;
  const filters: ReportsFilters = {
    month: normalizeMonth(params.month),
    year: normalizeYear(params.year),
    responsibleId: normalizeId(params.responsibleId),
    categoryId: normalizeId(params.categoryId),
    type: normalizeType(params.type),
    status: normalizeStatus(params.status),
  };
  const data = await getReportsData(filters);

  return (
    <AppShell>
      <ReportsView data={data} />
    </AppShell>
  );
}
