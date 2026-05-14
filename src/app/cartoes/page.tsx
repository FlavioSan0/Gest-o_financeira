import Link from "next/link";
import { ReceiptText } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { CreditCardForm } from "@/components/credit-cards/CreditCardForm";
import { CreditCardsList } from "@/components/credit-cards/CreditCardsList";
import { getCreditCardsPageData } from "@/services/credit-cards-service";

export default async function CreditCardsPage() {
  const data = await getCreditCardsPageData();

  return (
    <AppShell>
      <div className="app-container grid gap-6">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <p className="text-sm font-medium app-faint-text">
              Crédito e faturas
            </p>

            <h2 className="mt-1 text-3xl font-black tracking-[-0.04em] text-white">
              Cartões
            </h2>

            <p className="mt-2 text-sm app-muted-text">
              Cadastre e gerencie seus cartões de crédito.
            </p>
          </div>

          <Link href="/cartoes/faturas" className="app-button-secondary">
            <ReceiptText className="h-4 w-4" />
            Ver faturas
          </Link>
        </div>

        <div className="grid gap-6 xl:grid-cols-[0.72fr_1.28fr]">
          <CreditCardForm familyId={data.familyId} />

          <CreditCardsList
            creditCards={data.creditCards}
            summary={data.summary}
          />
        </div>
      </div>
    </AppShell>
  );
}