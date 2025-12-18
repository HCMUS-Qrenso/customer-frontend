"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { LanguageProvider, useLanguage } from "@/lib/i18n/context";
import { useVerifyTokenMutation } from "@/hooks/use-verify-token-mutation";
import { LanguageToggle } from "@/components/LanguageToggle";
import { TableHeroCard } from "@/components/TableHeroCard";
import { GuestCountStepper } from "@/components/GuestCountStepper";
import { StartSessionButton } from "@/components/StartSessionButton";
import { LoadingSkeleton } from "@/components/LoadingSkeleton";
import {
  InvalidQRError,
  NetworkError,
} from "@/components/ErrorStates";
import { Skeleton } from "@/components/ui/skeleton";
import { MapPin, AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TableLandingClientProps {
  tenantSlug: string;
  tableId?: string;
  token?: string;
}

// Loading component
function VerifyingLoading() {
  return (
    <div className="flex min-h-[100svh] flex-col items-center justify-center bg-slate-50">
      <div className="mb-4 size-12 animate-spin rounded-full border-4 border-slate-200 border-t-emerald-500" />
      <p className="text-slate-500">Đang xác thực mã QR...</p>
    </div>
  );
}

// Error component for token verification failure
function TokenVerificationError({ 
  message, 
  onRetry 
}: { 
  message: string; 
  onRetry: () => void;
}) {
  return (
    <div className="flex min-h-[100svh] flex-col items-center justify-center bg-slate-50 px-6 text-center">
      <div className="mb-6 flex size-20 items-center justify-center rounded-full bg-red-100">
        <AlertTriangle className="size-10 text-red-500" />
      </div>
      <h1 className="mb-2 text-2xl font-bold text-slate-900">Mã QR không hợp lệ</h1>
      <p className="mb-8 max-w-sm text-slate-500">{message}</p>
      <Button
        onClick={onRetry}
        className="gap-2 bg-emerald-500 text-white hover:bg-emerald-600"
      >
        <RefreshCw className="size-4" />
        Thử lại
      </Button>
    </div>
  );
}

// Missing token component
function MissingTokenError() {
  return (
    <div className="flex min-h-[100svh] flex-col items-center justify-center bg-slate-50 px-6 text-center">
      <div className="mb-6 flex size-20 items-center justify-center rounded-full bg-amber-100">
        <AlertTriangle className="size-10 text-amber-500" />
      </div>
      <h1 className="mb-2 text-2xl font-bold text-slate-900">Không tìm thấy mã QR</h1>
      <p className="max-w-sm text-slate-500">
        Vui lòng quét mã QR tại bàn để truy cập menu.
      </p>
    </div>
  );
}

function TableLandingContent({
  tenantSlug,
  tableId,
  token,
}: TableLandingClientProps) {
  const { t } = useLanguage();
  const router = useRouter();

  // Use verify token mutation
  const {
    mutate: verifyToken,
    data: verifyResult,
    isPending: isVerifying,
    error: verifyError,
    isSuccess,
    reset,
  } = useVerifyTokenMutation();

  // Verify token on mount
  useEffect(() => {
    if (token) {
      verifyToken(token);
    }
  }, [token, verifyToken]);

  const handleRetry = () => {
    if (token) {
      reset();
      verifyToken(token);
    }
  };

  // No token provided
  if (!token) {
    return <MissingTokenError />;
  }

  // Verifying token
  if (isVerifying) {
    return <VerifyingLoading />;
  }

  // Token verification error
  if (verifyError) {
    return (
      <TokenVerificationError 
        message={(verifyError as Error).message || "Không thể xác thực mã QR"} 
        onRetry={handleRetry}
      />
    );
  }

  // Token invalid
  if (isSuccess && !verifyResult?.valid) {
    return (
      <TokenVerificationError 
        message={verifyResult?.message || "Mã QR không hợp lệ hoặc đã hết hạn"} 
        onRetry={handleRetry}
      />
    );
  }

  // Token not verified yet
  if (!verifyResult?.valid || !verifyResult?.table) {
    return <VerifyingLoading />;
  }

  // Token verified successfully - show table landing page
  const table = verifyResult.table;

  return (
    <div className="relative mx-auto flex min-h-[100svh] w-full max-w-[480px] flex-col bg-slate-50 shadow-2xl sm:min-h-screen lg:max-w-2xl">
      {/* Header */}
      <header className="sticky top-0 z-30 flex items-start justify-between bg-slate-50/95 px-6 pb-2 pt-6 backdrop-blur-sm sm:pt-8">
        <div className="flex flex-col gap-0.5">
          <h1 className="text-2xl font-bold leading-tight tracking-tight text-slate-900">
            {tenantSlug}
          </h1>
          <div className="flex items-center gap-1 text-sm font-medium text-slate-500">
            <MapPin className="size-4" />
            <span>Bàn {table.tableNumber}</span>
          </div>
        </div>
        <LanguageToggle />
      </header>

      {/* Main Content */}
      <main className="flex flex-1 flex-col gap-6 px-6 pb-40 pt-4">
        <TableHeroCard
          tableNumber={table.tableNumber}
          capacity={table.capacity}
          isActive={table.status === "available"}
          zoneName={table.zoneId}
        />

        <GuestCountStepper />
      </main>

      {/* Sticky Bottom CTA */}
      <div className="fixed bottom-0 left-1/2 z-40 w-full max-w-[480px] -translate-x-1/2 lg:max-w-2xl">
        {/* Gradient Overlay */}
        <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-slate-50 via-slate-50/95 to-transparent" />

        <div className="relative flex flex-col items-center gap-3 px-6 pb-[calc(env(safe-area-inset-bottom,16px)+16px)] pt-4">
          <StartSessionButton
            tenantSlug={tenantSlug}
            tableCode={tableId || table.id}
            token={token}
            disabled={table.status !== "available"}
          />
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
