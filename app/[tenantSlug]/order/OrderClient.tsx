'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Receipt, UtensilsCrossed } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LanguageProvider, useLanguage } from '@/lib/i18n/context';
import { formatTime } from '@/lib/format';
import { useQrToken } from '@/hooks/use-qr-token';
import { mockOrder, ORDER_POLLING_CONFIG } from '@/lib/mocks';
import type { OrderDTO, OrderItemDTO } from '@/lib/types/order';
import { OrderItemGroupList } from '@/components/order/OrderItemGroupList';
import { OrderSummaryCard } from '@/components/order/OrderSummaryCard';
import { PageHeader } from '@/components/shared/PageHeader';
import { MobileStickyBar } from '@/components/shared/MobileStickyBar';
import { OrderStatusCard } from '@/components/shared/OrderStatusCard';

interface OrderClientProps {
  tenantSlug: string;
  tableId?: string;
  token?: string;
}


function OrderContent({ tenantSlug, tableId, token }: OrderClientProps) {
  const router = useRouter();
  const { t } = useLanguage();
  const [order] = useState(mockOrder);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // Store QR token
  useQrToken(token);

  // Polling for real-time updates
  useEffect(() => {
    if (!ORDER_POLLING_CONFIG.enabled) return;

    const interval = setInterval(() => {
      // In real implementation, fetch order updates
      setLastUpdated(new Date());
    }, ORDER_POLLING_CONFIG.interval);

    return () => clearInterval(interval);
  }, []);

  const menuHref = `/${tenantSlug}/menu?table=${tableId}&token=${token}`;
  const billHref = `/${tenantSlug}/bill?table=${tableId}&token=${token}`;

  // Group items by addedAt time
  const groupedItems = order.items.reduce(
    (groups, item) => {
      const time = formatTime(item.addedAt);
      if (!groups[time]) groups[time] = [];
      groups[time].push(item);
      return groups;
    },
    {} as Record<string, OrderItemDTO[]>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 text-slate-900 dark:text-white transition-colors">
      <PageHeader
        title={t.order.title}
        subtitle={`${tenantSlug} • ${t.checkout.table} ${tableId}`}
        onBack={() => router.push(menuHref)}
      />

      {/* Main Content */}
      <main className="flex-1 pb-40 lg:pb-12">
        <div className="mx-auto max-w-7xl px-4 py-6 lg:px-8">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-10">
            {/* Left: Order Details */}
            <div className="flex flex-col gap-6 lg:col-span-7 xl:col-span-8">
              {/* Order Status Card */}
              <OrderStatusCard
                orderLabel={t.bill.orderId}
                orderNumber={order.orderNumber}
                statusLabel={t.order.live}
                updatedAt={formatTime(lastUpdated.toISOString())}
                updatedLabel={t.bill.updated}
              />

              {/* Order Items */}
              <OrderItemGroupList groupedItems={groupedItems} />
            </div>

            {/* Right: Summary */}
            <div className="lg:col-span-5 xl:col-span-4">
              <OrderSummaryCard order={order} billHref={billHref} menuHref={menuHref} />
            </div>
          </div>
        </div>
      </main>

      {/* Mobile Sticky Action Bar */}
      <MobileStickyBar>
        <div className="flex gap-3">
          <Link href={billHref} className="flex-1">
            <Button className="w-full h-12 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-full flex items-center justify-center gap-2 shadow-sm">
              <Receipt className="size-5" />
              {t.order.requestBill}
            </Button>
          </Link>
          <Link href={menuHref}>
            <Button
              variant="outline"
              className="h-12 w-12 shrink-0 rounded-full border-gray-200 dark:border-slate-700 bg-gray-100 dark:bg-slate-800"
            >
              <UtensilsCrossed className="size-5" />
            </Button>
          </Link>
        </div>
      </MobileStickyBar>
    </div>
  );
}

export function OrderClient(props: OrderClientProps) {
  return (
    <LanguageProvider>
      <OrderContent {...props} />
    </LanguageProvider>
  );
}

