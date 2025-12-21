'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Receipt, UtensilsCrossed } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LanguageProvider, useLanguage } from '@/lib/i18n/context';
import { setQrToken } from '@/lib/stores/qr-token-store';
import type { OrderDTO, OrderItemDTO } from '@/lib/types/order';
import { OrderItemGroupList } from '@/components/order/OrderItemGroupList';
import { OrderSummaryCard } from '@/components/order/OrderSummaryCard';
import { PageHeader } from '@/components/shared/PageHeader';
import { MobileStickyBar } from '@/components/shared/MobileStickyBar';

interface OrderClientProps {
  tenantSlug: string;
  tableId?: string;
  token?: string;
}

// Polling toggle
const ENABLE_POLLING = true;
const POLL_INTERVAL = 10000; // 10 seconds

// Mock order data
const mockOrder: OrderDTO = {
  id: 'ord-1',
  orderNumber: 'A123',
  tableId: 'table-1',
  status: 'preparing',
  items: [
    {
      id: '1',
      name: 'Phở Bò Tái',
      nameEn: 'Rare Beef Pho',
      price: 75000,
      quantity: 2,
      modifiers: 'Size Lớn, Thêm thịt',
      image: 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=400',
      status: 'preparing',
      addedAt: new Date(Date.now() - 30 * 60000).toISOString(),
    },
    {
      id: '2',
      name: 'Bánh Mì Thịt Nướng',
      nameEn: 'Grilled Pork Banh Mi',
      price: 35000,
      quantity: 1,
      image: 'https://images.unsplash.com/photo-1600688640154-9619e002df30?w=400',
      status: 'ready',
      addedAt: new Date(Date.now() - 30 * 60000).toISOString(),
    },
    {
      id: '3',
      name: 'Trà Đá',
      nameEn: 'Iced Tea',
      price: 10000,
      quantity: 3,
      note: 'Ít đường',
      status: 'served',
      addedAt: new Date(Date.now() - 15 * 60000).toISOString(),
    },
  ] as OrderItemDTO[],
  subtotal: 215000,
  serviceCharge: 10750,
  tax: 0,
  total: 225750,
  createdAt: new Date().toISOString(),
};

function formatTime(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

function OrderContent({ tenantSlug, tableId, token }: OrderClientProps) {
  const router = useRouter();
  const { t } = useLanguage();
  const [order] = useState(mockOrder);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // Store QR token
  useEffect(() => {
    if (token) {
      setQrToken(token);
    }
  }, [token]);

  // Polling for real-time updates
  useEffect(() => {
    if (!ENABLE_POLLING) return;

    const interval = setInterval(() => {
      // In real implementation, fetch order updates
      setLastUpdated(new Date());
    }, POLL_INTERVAL);

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
              <div className="rounded-xl bg-white dark:bg-slate-800 p-5 shadow-sm border border-gray-200 dark:border-slate-700">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                      {t.bill.orderId}
                    </p>
                    <h2 className="text-2xl font-bold tracking-tight">{order.orderNumber}</h2>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 rounded-full bg-emerald-500/20 px-3 py-1.5 text-emerald-600 dark:text-emerald-400">
                      <span className="relative flex size-2.5">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75" />
                        <span className="relative inline-flex size-2.5 rounded-full bg-emerald-500" />
                      </span>
                      <span className="text-sm font-bold">{t.order.live}</span>
                    </div>
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      {t.bill.updated} {formatTime(lastUpdated.toISOString())}
                    </span>
                  </div>
                </div>
              </div>

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

