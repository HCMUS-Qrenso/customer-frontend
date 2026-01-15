"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
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
import { OperatingHoursButton } from "@/components/shared/OperatingHoursButton";
import {
  MapPin,
  AlertTriangle,
  CircleX,
  Clock,
  Phone,
  Mail,
} from "lucide-react";
import {
  setSessionToken,
  getSessionToken,
  clearSessionToken,
  getQrToken,
  getTableId,
} from "@/lib/stores/qr-token-store";
import {
  saveTenantSettings,
  saveTenantInfo,
} from "@/lib/stores/tenant-settings-store";

// Session expired banner component
function SessionExpiredBanner() {
  return (
    <div className="mb-4 flex items-center gap-3 rounded-xl bg-amber-50 dark:bg-amber-500/10 p-4 border border-amber-200 dark:border-amber-500/20">
      <div className="flex size-10 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400">
        <Clock className="size-5" />
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
          Phiên của bạn đã hết hạn
        </p>
        <p className="text-xs text-amber-600 dark:text-amber-400">
          Vui lòng bắt đầu phiên mới để tiếp tục đặt món.
        </p>
      </div>
    </div>
  );
}

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
  const searchParams = useSearchParams();
  const isSessionExpired = searchParams.get("session_expired") === "true";

  // Use props or fallback to persisted values from sessionStorage
  // This handles the case when token is removed from URL after verification
  const tableId = propsTableId || getTableId() || undefined;
  const token = propsToken || getQrToken() || undefined;

  // Store the QR token and tableId for API requests and navigation
  // IMPORTANT: Always call useQrToken with token/tableId (not conditional on tableContext)
  // This ensures tokens are restored from storage even when reloading page
  useQrToken(token, tableId);

  // Clear stale session token on mount (silent auto-recovery for fresh QR scan)
  // This prevents "token expired" error when user scans QR after long time
  useEffect(() => {
    const sessionToken = getSessionToken();
    if (!sessionToken) return;

    try {
      // Decode JWT to check expiry
      const base64Url = sessionToken.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join(""),
      );
      const payload = JSON.parse(jsonPayload);

      // Check if token is expired
      if (payload.exp && payload.exp * 1000 < Date.now()) {
        console.log("[TableLanding] Stale session token detected, clearing...");
        clearSessionToken();
        // No banner needed for fresh scan - silent recovery
      }
    } catch (err) {
      // Invalid token format - clear it
      console.log("[TableLanding] Invalid session token format, clearing...");
      clearSessionToken();
    }
  }, []);

  // Verify token and get table context from API
  const { data: tableContext, isLoading, error } = useVerifyTokenQuery(token);

  // Guest count state for validation (must be before early returns)
  const [guestCount, setGuestCount] = useState<number>(0);
  const handleGuestCountChange = useCallback((count: number) => {
    setGuestCount(count);
  }, []);

  // Save session token and tenant settings when received from verify response
  useEffect(() => {
    // if (isSessionExpired) return; // Don't overwrite on session expired

    if (tableContext?.session_token) {
      setSessionToken(tableContext.session_token);
      console.log(
        "[TableLanding] Session token saved:",
        tableContext.session_token.substring(0, 20) + "...",
      );
    }
    // Save tenant settings from verify-token response
    if (tableContext?.tenantSettings) {
      saveTenantSettings(tableContext.tenantSettings);
      console.log(
        "[TableLanding] Tenant settings saved:",
        tableContext.tenantSettings,
      );
    }
    // Save tenant info
    if (tableContext?.tenantName) {
      saveTenantInfo({
        name: tableContext.tenantName,
        address: null,
        image: tableContext.tenantImage || null,
      });
    }
  }, [
    tableContext?.session_token,
    tableContext?.tenantSettings,
    tableContext?.tenantName,
    tableContext?.tenantImage,
  ]);

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

  // Order settings
  const requireGuestCount =
    tableContext.tenantSettings?.order?.require_guest_count ?? false;

  // Guest count is always valid if not required (uses table capacity implicitly)
  // If required, need guest count > 0
  const isGuestCountValid = !requireGuestCount || guestCount > 0;

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
            <span className="text-slate-300 dark:text-slate-600">•</span>
            <OperatingHoursButton />
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
        {/* Session Expired Banner */}
        {isSessionExpired && <SessionExpiredBanner />}

        <TableHeroCard
          tableNumber={table.tableNumber}
          capacity={table.capacity}
          isActive={table.status === "available"}
          zoneName={tableContext.zoneName}
          coverImageUrl={tableContext.tenantImage}
        />

        {/* Guest Count - Only show if require_guest_count is enabled */}
        {requireGuestCount && (
          <GuestCountStepper onChange={handleGuestCountChange} />
        )}

        {/* Contact Info */}
        {(tableContext.tenantSettings?.phone ||
          tableContext.tenantSettings?.contact_email) && (
          <div className="mt-4 rounded-xl bg-white dark:bg-slate-800 p-4 shadow-sm border border-slate-200 dark:border-slate-700">
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
              Liên hệ
            </h3>
            <div className="flex flex-col gap-2">
              {tableContext.tenantSettings.phone && (
                <a
                  href={`tel:${tableContext.tenantSettings.phone}`}
                  className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                >
                  <div className="flex size-8 items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-500/10">
                    <Phone className="size-4 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <span>{tableContext.tenantSettings.phone}</span>
                </a>
              )}
              {tableContext.tenantSettings.contact_email && (
                <a
                  href={`mailto:${tableContext.tenantSettings.contact_email}`}
                  className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                >
                  <div className="flex size-8 items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-500/10">
                    <Mail className="size-4 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <span>{tableContext.tenantSettings.contact_email}</span>
                </a>
              )}
            </div>
          </div>
        )}
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
            disabled={table.status !== "available" || !isGuestCountValid}
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
