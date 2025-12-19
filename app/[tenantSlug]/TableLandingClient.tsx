"use client";

import { useEffect } from "react";
import { LanguageProvider, useLanguage } from "@/lib/i18n/context";
import { setQrToken } from "@/lib/stores/qr-token-store";
import { useVerifyTokenQuery } from "@/hooks/use-table-context-query";
import { LanguageToggle } from "@/components/LanguageToggle";
import { TableHeroCard } from "@/components/TableHeroCard";
import { GuestCountStepper } from "@/components/GuestCountStepper";
import { StartSessionButton } from "@/components/StartSessionButton";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Skeleton } from "@/components/ui/skeleton";
import { MapPin, AlertTriangle, Clock } from "lucide-react";

interface TableLandingClientProps {
  tenantSlug: string;
  tableId?: string;
  token?: string;
}

// Error component for expired/invalid QR token
function ExpiredTokenError() {
  const { t } = useLanguage();
  return (
    <div className="flex min-h-[100svh] flex-col items-center justify-center bg-slate-50 dark:bg-slate-900 px-6 text-center transition-colors">
      <div className="mb-6 flex size-20 items-center justify-center rounded-3xl bg-amber-50 dark:bg-amber-500/10 text-amber-500 shadow-sm ring-1 ring-amber-100 dark:ring-amber-500/20">
        <Clock className="size-10" />
      </div>
      <h1 className="mb-2 font-display text-2xl font-bold text-slate-900 dark:text-white">
        Mã QR hết hạn
      </h1>
      <p className="max-w-sm text-slate-500 dark:text-slate-400">
        Mã QR này đã hết hạn hoặc không còn hợp lệ. Vui lòng quét lại mã QR tại bàn.
      </p>
    </div>
  );
}

// Error component for invalid QR token
function InvalidTokenError() {
  return (
    <div className="flex min-h-[100svh] flex-col items-center justify-center bg-slate-50 dark:bg-slate-900 px-6 text-center transition-colors">
      <div className="mb-6 flex size-20 items-center justify-center rounded-3xl bg-red-50 dark:bg-red-500/10 text-red-500 shadow-sm ring-1 ring-red-100 dark:ring-red-500/20">
        <AlertTriangle className="size-10" />
      </div>
      <h1 className="mb-2 font-display text-2xl font-bold text-slate-900 dark:text-white">Mã QR không hợp lệ</h1>
      <p className="max-w-sm text-slate-500 dark:text-slate-400">
        Mã QR bạn quét không đúng định dạng. Vui lòng quét lại mã QR tại bàn.
      </p>
    </div>
  );
}

// Missing token component
function MissingTokenError() {
  return (
    <div className="flex min-h-[100svh] flex-col items-center justify-center bg-slate-50 dark:bg-slate-900 px-6 text-center transition-colors">
      <div className="mb-6 flex size-20 items-center justify-center rounded-3xl bg-amber-50 dark:bg-amber-500/10 text-amber-500 shadow-sm ring-1 ring-amber-100 dark:ring-amber-500/20">
        <AlertTriangle className="size-10" />
      </div>
      <h1 className="mb-2 font-display text-2xl font-bold text-slate-900 dark:text-white">Không tìm thấy mã QR</h1>
      <p className="max-w-sm text-slate-500 dark:text-slate-400">
        Vui lòng quét mã QR tại bàn để truy cập menu.
      </p>
    </div>
  );
}

// Loading skeleton component
function LoadingSkeleton() {
  return (
    <div className="relative mx-auto flex min-h-[100svh] w-full max-w-[480px] flex-col bg-slate-50/50 dark:bg-slate-900 shadow-2xl sm:min-h-screen lg:max-w-xl transition-colors">
      {/* Header skeleton */}
      <header className="sticky top-0 z-30 flex items-start justify-between bg-slate-50/95 dark:bg-slate-900/95 px-6 pb-2 pt-6 backdrop-blur-sm">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-7 w-48 bg-slate-200 dark:bg-slate-700" />
          <Skeleton className="h-4 w-32 bg-slate-200 dark:bg-slate-700" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="size-10 rounded-full bg-slate-200 dark:bg-slate-700" />
          <Skeleton className="size-10 rounded-full bg-slate-200 dark:bg-slate-700" />
        </div>
      </header>

      {/* Main content skeleton */}
      <main className="relative z-10 flex flex-1 flex-col gap-6 px-5 pb-32 pt-2 sm:px-6">
        <Skeleton className="h-72 w-full rounded-3xl bg-slate-200 dark:bg-slate-700" />
        <Skeleton className="h-24 w-full rounded-2xl bg-slate-200 dark:bg-slate-700" />
      </main>
    </div>
  );
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
  useEffect(() => {
    if (token && tableContext) {
      setQrToken(token);
    }
  }, [token, tableContext]);

  // No token provided
  if (!token) {
    return <MissingTokenError />;
  }

  // Loading state
  if (isLoading) {
    return <LoadingSkeleton />;
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
    <div className="relative mx-auto flex min-h-[100svh] w-full max-w-[480px] flex-col bg-slate-50/50 dark:bg-slate-900 shadow-2xl sm:min-h-screen lg:max-w-xl transition-colors">
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
      <main className="relative z-10 flex flex-1 flex-col gap-6 px-5 pb-32 pt-2 sm:px-6">
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
      <div className="fixed bottom-0 left-1/2 z-40 w-full max-w-[480px] -translate-x-1/2 lg:max-w-xl">
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
