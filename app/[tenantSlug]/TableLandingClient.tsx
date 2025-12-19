"use client";

import { useEffect, useMemo } from "react";
import { LanguageProvider } from "@/lib/i18n/context";
import { setQrToken } from "@/lib/stores/qr-token-store";
import { decodeQrToken } from "@/lib/utils/jwt-decode";
import { LanguageToggle } from "@/components/LanguageToggle";
import { TableHeroCard } from "@/components/TableHeroCard";
import { GuestCountStepper } from "@/components/GuestCountStepper";
import { StartSessionButton } from "@/components/StartSessionButton";
import { MapPin, AlertTriangle, UtensilsCrossed } from "lucide-react";
import { cn } from "@/lib/utils";

interface TableLandingClientProps {
  tenantSlug: string;
  tableId?: string;
  token?: string;
}

// Error component for invalid QR token
function InvalidTokenError() {
  return (
    <div className="flex min-h-[100svh] flex-col items-center justify-center bg-slate-50 px-6 text-center">
      <div className="mb-6 flex size-20 items-center justify-center rounded-3xl bg-red-50 text-red-500 shadow-sm ring-1 ring-red-100">
        <AlertTriangle className="size-10" />
      </div>
      <h1 className="mb-2 font-display text-2xl font-bold text-slate-900">Mã QR không hợp lệ</h1>
      <p className="max-w-sm text-slate-500">
        Mã QR bạn quét không đúng định dạng. Vui lòng quét lại mã QR tại bàn.
      </p>
    </div>
  );
}

// Missing token component
function MissingTokenError() {
  return (
    <div className="flex min-h-[100svh] flex-col items-center justify-center bg-slate-50 px-6 text-center">
      <div className="mb-6 flex size-20 items-center justify-center rounded-3xl bg-amber-50 text-amber-500 shadow-sm ring-1 ring-amber-100">
        <AlertTriangle className="size-10" />
      </div>
      <h1 className="mb-2 font-display text-2xl font-bold text-slate-900">Không tìm thấy mã QR</h1>
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
  // Decode the QR token to get table info
  const tokenPayload = useMemo(() => {
    if (!token) return null;
    return decodeQrToken(token);
  }, [token]);

  // Store the QR token for API requests
  useEffect(() => {
    if (token && tokenPayload) {
      setQrToken(token);
    }
  }, [token, tokenPayload]);

  // No token provided
  if (!token) {
    return <MissingTokenError />;
  }

  // Token invalid (can't decode)
  if (!tokenPayload) {
    return <InvalidTokenError />;
  }

  // Token decoded successfully - show table landing page
  const table = {
    id: tokenPayload.tableId,
    tableNumber: tokenPayload.tableNumber,
    capacity: 4, // Default capacity, will be fetched from API later if needed
    status: "available" as const, // Assume available, server will validate on API calls
  };

  return (
    <div className="relative mx-auto flex min-h-[100svh] w-full max-w-[480px] flex-col bg-slate-50/50 shadow-2xl sm:min-h-screen lg:max-w-xl">
      {/* Background Pattern */}
      <div className="pointer-events-none absolute inset-0 z-0 opacity-[0.03]" 
           style={{ backgroundImage: 'radial-gradient(#0f172a 1px, transparent 1px)', backgroundSize: '24px 24px' }} 
      />

      {/* Header */}
      <header className="sticky top-0 z-30 flex items-center justify-between bg-white/80 px-6 py-4 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-slate-900 text-white shadow-md">
            <UtensilsCrossed className="size-5" />
          </div>
          <div className="flex flex-col">
            <h1 className="font-display text-lg font-bold leading-tight text-slate-900">
              {tenantSlug}
            </h1>
            <div className="flex items-center gap-1 text-xs font-medium text-slate-500">
              <MapPin className="size-3" />
              <span>Bàn số {table.tableNumber}</span>
            </div>
          </div>
        </div>
        <LanguageToggle />
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex flex-1 flex-col gap-6 px-5 pb-32 pt-2 sm:px-6">
        <TableHeroCard
          tableNumber={table.tableNumber}
          capacity={table.capacity}
          isActive={table.status === "available"}
          zoneName={undefined}
        />

        <GuestCountStepper />
      </main>

      {/* Sticky Bottom CTA */}
      <div className="fixed bottom-0 left-1/2 z-40 w-full max-w-[480px] -translate-x-1/2 lg:max-w-xl">
        {/* Gradient Overlay */}
        <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-white via-white/95 to-transparent" />

        <div className="relative flex flex-col items-center gap-3 px-6 pb-[calc(env(safe-area-inset-bottom,20px)+20px)] pt-4">
          <StartSessionButton
            tenantSlug={tenantSlug}
            tableCode={tableId || table.id}
            token={token}
            disabled={table.status !== "available"}
          />
          <p className="text-center text-xs text-slate-400">
            Bằng cách bắt đầu, bạn đồng ý với điều khoản sử dụng của nhà hàng.
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


