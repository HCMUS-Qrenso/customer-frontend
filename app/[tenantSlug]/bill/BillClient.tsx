"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { CreditCard, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LanguageProvider, useLanguage } from "@/lib/i18n/context";
import { formatTime } from "@/lib/format";
import { useQrToken } from "@/hooks/use-qr-token";
import { getQrToken, getTableId } from "@/lib/stores/qr-token-store";
import { decodeQrToken } from "@/lib/utils/jwt-decode";
import { mockBill } from "@/lib/mocks";
import type { BillDTO } from "@/lib/types/checkout";
import { BillItemsList } from "@/components/bill/BillItemsList";
import { BillSummaryCard } from "@/components/bill/BillSummaryCard";
import { PageHeader } from "@/components/shared/PageHeader";
import { MobileStickyBar } from "@/components/shared/MobileStickyBar";
import { OrderStatusCard } from "@/components/shared/OrderStatusCard";
import { UserAvatar } from "@/components/auth/UserAvatar";

interface BillClientProps {
  tenantSlug: string;
  tableId?: string;
  token?: string;
}

function BillContent({
  tenantSlug,
  tableId: propsTableId,
  token: propsToken,
}: BillClientProps) {
  const router = useRouter();
  const { t } = useLanguage();

  // Use props or fallback to persisted values from sessionStorage
  const tableId = propsTableId || getTableId() || undefined;
  const token = propsToken || getQrToken() || undefined;

  // Store QR token and tableId
  useQrToken(token, tableId);

  // Decode token to get table number
  const tableNumber = useMemo(() => {
    if (!token) return null;
    const payload = decodeQrToken(token);
    return payload?.tableNumber || null;
  }, [token]);

  // URLs (no need to include table/token params - they're in storage)
  const menuHref = `/${tenantSlug}/menu`;
  const checkoutHref = `/${tenantSlug}/checkout`;

  return (
    <div className="relative flex min-h-screen flex-col overflow-x-hidden bg-gray-50 dark:bg-slate-900 text-slate-900 dark:text-white transition-colors">
      <PageHeader
        title={t.bill.title}
        subtitle={
          tableNumber ? `${tenantSlug} • Bàn ${tableNumber}` : tenantSlug
        }
        onBack={() => router.back()}
        rightContent={<UserAvatar />}
      />

      {/* Main Content */}
      <main className="flex-1 pb-40 lg:pb-12">
        <div className="mx-auto max-w-7xl px-4 py-6 lg:px-8">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-10">
            {/* Left: Bill Items */}
            <div className="flex flex-col gap-6 lg:col-span-7 xl:col-span-8">
              {/* Order Status Card */}
              <OrderStatusCard
                orderLabel={t.bill.orderId}
                orderNumber={mockBill.orderNumber}
                statusLabel={t.bill.dining}
                updatedAt={formatTime(mockBill.items[0].addedAt)}
                updatedLabel={t.bill.updated}
              />

              <BillItemsList items={mockBill.items} />
            </div>

            {/* Right: Summary */}
            <div className="lg:col-span-5 xl:col-span-4">
              <BillSummaryCard
                bill={mockBill}
                menuHref={menuHref}
                checkoutHref={checkoutHref}
              />
            </div>
          </div>
        </div>
      </main>

      {/* Mobile Sticky Action Bar */}
      <MobileStickyBar>
        <div className="flex flex-col gap-3">
          <div className="flex gap-3">
            <Link href={checkoutHref} className="flex-1">
              <Button className="w-full h-12 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-full flex items-center justify-center gap-2 shadow-sm">
                <CreditCard className="size-5" />
                {t.bill.payNow}
              </Button>
            </Link>
            <Button
              variant="outline"
              className="h-12 w-12 shrink-0 rounded-full border-gray-200 dark:border-slate-700 bg-gray-100 dark:bg-slate-800"
            >
              <Bell className="size-5" />
            </Button>
          </div>
          <Link
            href={menuHref}
            className="text-center text-xs font-bold text-emerald-600 dark:text-emerald-400"
          >
            {t.cart.backToMenu}
          </Link>
        </div>
      </MobileStickyBar>
    </div>
  );
}

export function BillClient(props: BillClientProps) {
  return (
    <LanguageProvider>
      <BillContent {...props} />
    </LanguageProvider>
  );
}
