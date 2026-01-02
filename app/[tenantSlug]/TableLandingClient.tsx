"use client";

import { useEffect } from "react";
import { LanguageProvider, useLanguage } from "@/lib/i18n/context";
import { useQrToken } from "@/hooks/use-qr-token";
import { useVerifyTokenQuery } from "@/hooks/use-table-context-query";
import { LanguageToggle } from "@/components/LanguageToggle";
import { TableHeroCard } from "@/components/TableHeroCard";
import { GuestCountStepper } from "@/components/GuestCountStepper";
import { StartSessionButton } from "@/components/StartSessionButton";
import { ThemeToggle } from "@/components/ThemeToggle";
import { UserAvatar } from "@/components/auth/UserAvatar";
import { Skeleton } from "@/components/ui/skeleton";
import { PageLoadingSkeleton } from "@/components/shared/LoadingState";
import { MapPin, AlertTriangle, CircleX } from "lucide-react";
import {
  setSessionToken,
  getQrToken,
  getTableId,
} from "@/lib/stores/qr-token-store";

interface TableLandingClientProps {
  tenantSlug: string;
  tableId?: string;
  token?: string;
}

// Error component for expired/invalid QR token
function TokenError({ message }: { message?: string }) {
  const { t } = useLanguage();
  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-slate-50 dark:bg-slate-900 px-6 text-center transition-colors">
      <div className="mb-6 flex size-20 items-center justify-center rounded-3xl bg-amber-50 dark:bg-amber-500/10 text-amber-500 shadow-sm ring-1 ring-amber-100 dark:ring-amber-500/20">
        <CircleX className="size-10" />
      </div>
      <h1 className="mb-2 font-display text-2xl font-bold text-slate-900 dark:text-white">
        Không thể tải menu
      </h1>
      <p className="max-w-sm text-slate-500 dark:text-slate-400">
        {message == "Unauthorized"
          ? "Mã QR bạn quét đã hết hạn hoặc không hợp lệ. Vui lòng quét lại mã QR tại bàn."
          : message}
      </p>
    </div>
  );
}

// Error component for invalid QR token
function InvalidTokenError() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-slate-50 dark:bg-slate-900 px-6 text-center transition-colors">
      <div className="mb-6 flex size-20 items-center justify-center rounded-3xl bg-red-50 dark:bg-red-500/10 text-red-500 shadow-sm ring-1 ring-red-100 dark:ring-red-500/20">
        <AlertTriangle className="size-10" />
      </div>
      <h1 className="mb-2 font-display text-2xl font-bold text-slate-900 dark:text-white">
        Mã QR không hợp lệ
      </h1>
      <p className="max-w-sm text-slate-500 dark:text-slate-400">
        Mã QR bạn quét không đúng định dạng. Vui lòng quét lại mã QR tại bàn.
      </p>
    </div>
  );
}

// Missing token component
function MissingTokenError() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-slate-50 dark:bg-slate-900 px-6 text-center transition-colors">
      <div className="mb-6 flex size-20 items-center justify-center rounded-3xl bg-amber-50 dark:bg-amber-500/10 text-amber-500 shadow-sm ring-1 ring-amber-100 dark:ring-amber-500/20">
        <AlertTriangle className="size-10" />
      </div>
      <h1 className="mb-2 font-display text-2xl font-bold text-slate-900 dark:text-white">
        Không tìm thấy mã QR
      </h1>
      <p className="max-w-sm text-slate-500 dark:text-slate-400">
        Vui lòng quét mã QR tại bàn để truy cập menu.
      </p>
    </div>
  );
}

// Loading skeleton component
function LoadingSkeleton() {
  return (
    <div className="relative flex min-h-svh w-full flex-col bg-slate-50/50 dark:bg-slate-900 shadow-2xl sm:min-h-screen transition-colors lg:px-40">
      {/* Background Pattern */}
      <div
        className="pointer-events-none absolute inset-0 z-0 opacity-[0.03] dark:opacity-[0.05]"
        style={{
          backgroundImage: "radial-gradient(#0f172a 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />

      {/* Header skeleton */}
      <header className="sticky top-0 z-30 flex items-start justify-between bg-slate-50/95 dark:bg-slate-900/95 px-6 pb-2 pt-6 backdrop-blur-sm">
        <div className="flex flex-col gap-0.5">
          <Skeleton className="h-7 w-48 bg-slate-200 dark:bg-slate-700" />
          <div className="flex items-center gap-1">
            <Skeleton className="size-4 bg-slate-200 dark:bg-slate-700" />
            <Skeleton className="h-4 w-32 bg-slate-200 dark:bg-slate-700" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="size-10 rounded-full bg-slate-200 dark:bg-slate-700" />
          <Skeleton className="size-10 rounded-full bg-slate-200 dark:bg-slate-700" />
        </div>
      </header>

      {/* Main content skeleton */}
      <main className="relative z-10 flex flex-1 flex-col gap-6 px-5 pb-40 pt-2 sm:px-6">
        <Skeleton className="h-72 w-full rounded-3xl bg-slate-200 dark:bg-slate-700" />
        <Skeleton className="h-24 w-full rounded-2xl bg-slate-200 dark:bg-slate-700" />
      </main>

      {/* Sticky Bottom CTA skeleton */}
      <div className="fixed bottom-0 left-1/2 z-40 w-full -translate-x-1/2 lg:px-40">
        {/* Gradient Overlay */}
        <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-white dark:from-slate-900 via-white/95 dark:via-slate-900/95 to-transparent" />

        <div className="relative flex flex-col items-center gap-3 px-6 pb-[calc(env(safe-area-inset-bottom,20px)+20px)] pt-4">
          <Skeleton className="h-12 w-full max-w-xs rounded-full bg-slate-200 dark:bg-slate-700" />
          <Skeleton className="h-3 w-48 bg-slate-200 dark:bg-slate-700" />
        </div>
      </div>
    </div>
  );
}

function TableLandingContent({
  tenantSlug,
  tableId: propsTableId,
  token: propsToken,
}: TableLandingClientProps) {
  const { t } = useLanguage();

  // Use props or fallback to persisted values from sessionStorage
  // This handles the case when token is removed from URL after verification
  const tableId = propsTableId || getTableId() || undefined;
  const token = propsToken || getQrToken() || undefined;

  // Store the QR token and tableId for API requests and navigation
  // IMPORTANT: Always call useQrToken with token/tableId (not conditional on tableContext)
  // This ensures tokens are restored from storage even when reloading page
  useQrToken(token, tableId);

  // Verify token and get table context from API
  const { data: tableContext, isLoading, error } = useVerifyTokenQuery(token);

  // Save session token when received from verify response
  useEffect(() => {
    if (tableContext?.session_token) {
      setSessionToken(tableContext.session_token);
      console.log(
        "[TableLanding] Session token saved:",
        tableContext.session_token.substring(0, 20) + "...",
      );
    }
  }, [tableContext?.session_token]);

  // Save returnUrl for redirect after login
  useEffect(() => {
    if (tenantSlug && tableId && token && tableContext) {
      import("@/lib/utils/return-url").then(({ saveReturnUrl }) => {
        saveReturnUrl({
          tenantSlug,
          tableId,
          token,
          path: "/menu", // Default to menu after landing
        });
      });
    }
  }, [tenantSlug, tableId, token, tableContext]);

  // No token provided (neither from URL nor storage)
  if (!token) {
    return <MissingTokenError />;
  }

  // Loading state
  if (isLoading) {
    return <PageLoadingSkeleton />;
  }

  // Token expired or invalid (API returned error) or table under maintenance
  if (error) {
    return <TokenError message={error.message} />;
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
      <div
        className="pointer-events-none absolute inset-0 z-0 opacity-[0.03] dark:opacity-[0.05]"
        style={{
          backgroundImage: "radial-gradient(#0f172a 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />

      {/* Header */}
      <header className="sticky top-0 z-30 flex items-start justify-between bg-slate-50/95 dark:bg-slate-900/95 px-6 pb-2 pt-6 backdrop-blur-sm">
        <div className="flex flex-col gap-0.5">
          <h1 className="text-2xl font-bold leading-tight tracking-tight text-slate-900 dark:text-white">
            {tableContext.tenantName || tenantSlug}
          </h1>
          <div className="flex items-center gap-1 text-sm font-medium text-slate-500 dark:text-slate-400">
            <MapPin className="size-4" />
            <span>{tableContext.zoneName || "Restaurant"}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <LanguageToggle />
          <UserAvatar />
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
      <TableLandingContent
        tenantSlug={tenantSlug}
        tableId={tableId}
        token={token}
      />
    </LanguageProvider>
  );
}
