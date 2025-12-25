"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Receipt, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LanguageProvider, useLanguage } from "@/lib/i18n/context";
import { useQrToken } from "@/hooks/use-qr-token";
import { mockOrderTracking } from "@/lib/mocks";
import { OrderStatusStepper } from "@/components/track/OrderStatusStepper";
import { BatchItemsList } from "@/components/track/BatchItemsList";
import { OrderTimeline } from "@/components/track/OrderTimeline";
import { PageHeader } from "@/components/shared/PageHeader";
import { MobileStickyBar } from "@/components/shared/MobileStickyBar";
import { LiveIndicator } from "@/components/shared/LiveIndicator";

interface OrderTrackingClientProps {
  tenantSlug: string;
  tableId?: string;
  token?: string;
}

function OrderTrackingContent({
  tenantSlug,
  tableId,
  token,
}: OrderTrackingClientProps) {
  const router = useRouter();
  const { t } = useLanguage();

  // Store QR token
  useQrToken(token);

  const menuHref = `/${tenantSlug}/menu?table=${tableId}&token=${token}`;
  const billHref = `/${tenantSlug}/bill?table=${tableId}&token=${token}`;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 text-slate-900 dark:text-white transition-colors">
      <PageHeader
        title={tenantSlug}
        subtitle={`${t.checkout.table} ${tableId}`}
        onBack={() => router.push(menuHref)}
        maxWidth="2xl"
      />

      <main className="mx-auto max-w-2xl pb-32">
        {/* Order Status Card */}
        <div className="p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-gray-200 dark:border-slate-700 flex justify-between items-start">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-xl font-bold">
                    {mockOrderTracking.orderNumber}
                  </h2>
                  <LiveIndicator size="md" />
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {t.track.createdAt}: {mockOrderTracking.createdAt}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs font-bold text-emerald-500 uppercase tracking-wide">
                  {t.track.liveUpdate}
                </p>
                <p className="text-xs text-slate-400">
                  {mockOrderTracking.updatedAt}
                </p>
              </div>
            </div>

            {/* Stepper */}
            <OrderStatusStepper currentStatus={mockOrderTracking.status} />
          </div>
        </div>

        {/* Batches */}
        <BatchItemsList batches={mockOrderTracking.batches} />

        {/* Timeline */}
        <OrderTimeline entries={mockOrderTracking.timeline} />
      </main>

      {/* Sticky Bottom Action Bar */}
      <MobileStickyBar maxWidth="2xl">
        <div className="flex gap-3">
          <Link href={billHref} className="flex-1">
            <Button
              variant="outline"
              className="w-full h-12 rounded-full border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-800 font-bold"
            >
              <Receipt className="size-5 mr-2" />
              {t.order.requestBill}
            </Button>
          </Link>
          <Link href={menuHref} className="flex-2">
            <Button className="w-full h-12 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-full shadow-md shadow-emerald-500/30">
              <Plus className="size-5 mr-2" />
              {t.order.addMoreItems}
            </Button>
          </Link>
        </div>
      </MobileStickyBar>
    </div>
  );
}

export function OrderTrackingClient(props: OrderTrackingClientProps) {
  return (
    <LanguageProvider>
      <OrderTrackingContent {...props} />
    </LanguageProvider>
  );
}
