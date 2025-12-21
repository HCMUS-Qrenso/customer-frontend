"use client";

import { LanguageProvider, useLanguage } from "@/lib/i18n/context";
import { useQrToken } from "@/hooks/use-qr-token";
import { useVerifyTokenQuery } from "@/hooks/use-table-context-query";
import { LanguageToggle } from "@/components/LanguageToggle";
import { TableHeroCard } from "@/components/TableHeroCard";
import { GuestCountStepper } from "@/components/GuestCountStepper";
import { StartSessionButton } from "@/components/StartSessionButton";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ExpiredTokenError, InvalidTokenError, MissingTokenError } from "@/components/ErrorStates";
import { PageLoadingSkeleton } from "@/components/shared/LoadingState";
import { MapPin } from "lucide-react";

interface TableLandingClientProps {
  tenantSlug: string;
  tableId?: string;
  token?: string;
}


function TableLandingContent({
  tenantSlug,
  tableId,
  token,
}: TableLandingClientProps) {
  const { t } = useLanguage();

  // Verify token and get table context from API
  const { data: tableContext, isLoading, error } = useVerifyTokenQuery(token);

  // Store the QR token for API requests
  useQrToken(tableContext ? token : undefined);

  // No token provided
  if (!token) {
    return <MissingTokenError />;
  }

  // Loading state
  if (isLoading) {
    return <PageLoadingSkeleton />;
  }

  // Token expired or invalid (API returned error)
  if (error) {
    return <ExpiredTokenError />;
  }

  // No table context returned
  if (!tableContext) {
    return <InvalidTokenError />;
  }

  // Table context loaded successfully - show table landing page
  const table = {
    id: tableContext.tableId,
    tableNumber: tableContext.tableNumber,
    capacity: tableContext.tableCapacity || 4,
    status: "available" as const,
  };

  return (
    <div className="relative flex min-h-svh w-full flex-col bg-slate-50/50 dark:bg-slate-900 shadow-2xl sm:min-h-screen transition-colors lg:px-40">
      {/* Background Pattern */}
      <div className="pointer-events-none absolute inset-0 z-0 opacity-[0.03] dark:opacity-[0.05]" 
           style={{ backgroundImage: 'radial-gradient(#0f172a 1px, transparent 1px)', backgroundSize: '24px 24px' }} 
      />

      {/* Header */}
      <header className="sticky top-0 z-30 flex items-start justify-between bg-slate-50/95 dark:bg-slate-900/95 px-6 pb-2 pt-6 backdrop-blur-sm">
        <div className="flex flex-col gap-0.5">
          <h1 className="text-2xl font-bold leading-tight tracking-tight text-slate-900 dark:text-white">
            {tableContext.tenantName || tenantSlug}
          </h1>
          <div className="flex items-center gap-1 text-sm font-medium text-slate-500 dark:text-slate-400">
            <MapPin className="size-4" />
            <span>{tableContext.zoneName || 'Restaurant'}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <LanguageToggle />
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex flex-1 flex-col gap-6 px-5 pb-40 pt-2 sm:px-6">
        <TableHeroCard
          tableNumber={table.tableNumber}
          capacity={table.capacity}
          isActive={table.status === "available"}
          zoneName={tableContext.zoneName}
          coverImageUrl={tableContext.tenantImage}
        />

        <GuestCountStepper />
      </main>

      {/* Sticky Bottom CTA */}
      <div className="fixed bottom-0 left-1/2 z-40 w-full -translate-x-1/2 lg:px-40">
        {/* Gradient Overlay */}
        <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-white dark:from-slate-900 via-white/95 dark:via-slate-900/95 to-transparent" />

        <div className="relative flex flex-col items-center gap-3 px-6 pb-[calc(env(safe-area-inset-bottom,20px)+20px)] pt-4">
          <StartSessionButton
            tenantSlug={tenantSlug}
            tableCode={tableId || table.id}
            token={token}
            disabled={table.status !== "available"}
          />
          <p className="text-center text-xs text-slate-400">
            {t.cta.termsAgreement}
          </p>
        </div>
      </div>
    </div>
  );
}

export function TableLandingClient({
  tenantSlug,
  tableId,
  token,
}: TableLandingClientProps) {
  return (
    <LanguageProvider>
      <TableLandingContent tenantSlug={tenantSlug} tableId={tableId} token={token} />
    </LanguageProvider>
  );
}
