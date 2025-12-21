'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Receipt, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LanguageProvider, useLanguage } from '@/lib/i18n/context';
import { LanguageToggle } from '@/components/LanguageToggle';
import { ThemeToggle } from '@/components/ThemeToggle';
import { setQrToken } from '@/lib/stores/qr-token-store';
import { OrderStatusStepper } from '@/components/track/OrderStatusStepper';
import { BatchItemsList } from '@/components/track/BatchItemsList';
import { OrderTimeline } from '@/components/track/OrderTimeline';

interface OrderTrackingClientProps {
  tenantSlug: string;
  tableId?: string;
  token?: string;
}

// Mock order tracking data
const mockOrderTracking = {
  id: 'order-001',
  orderNumber: '#8821',
  status: 'preparing' as const,
  createdAt: '12:30 PM',
  updatedAt: 'Just now',
  batches: [
    {
      id: 'batch-2',
      batchNumber: 2,
      createdAt: '12:45 PM',
      itemCount: 3,
      status: 'preparing' as const,
      items: [
        {
          id: 'item-1',
          name: 'Phở Bò',
          nameEn: 'Pho Bo',
          quantity: 2,
          price: 150000,
          image: 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=400',
          modifiers: 'Size L, No onions',
          status: 'preparing' as const,
        },
        {
          id: 'item-2',
          name: 'Gỏi Cuốn',
          nameEn: 'Spring Rolls',
          quantity: 1,
          price: 50000,
          image: 'https://images.unsplash.com/photo-1562967916-eb82221dfb92?w=400',
          modifiers: 'Peanut sauce',
          status: 'ready' as const,
        },
      ],
    },
    {
      id: 'batch-1',
      batchNumber: 1,
      createdAt: '12:30 PM',
      itemCount: 1,
      status: 'served' as const,
      items: [
        {
          id: 'item-3',
          name: 'Bánh Mì Đặc Biệt',
          nameEn: 'Banh Mi Special',
          quantity: 1,
          price: 45000,
          image: 'https://images.unsplash.com/photo-1600688640154-9619e002df30?w=400',
          modifiers: 'Less spicy',
          status: 'served' as const,
        },
      ],
    },
  ],
  timeline: [
    { time: '12:50 PM', message: 'Kitchen started preparing Batch 2' },
    { time: '12:45 PM', message: 'Batch 2 added (3 items)' },
    { time: '12:40 PM', message: 'Batch 1 Served' },
    { time: '12:30 PM', message: 'Order Created' },
  ],
};

function OrderTrackingContent({ tenantSlug, tableId, token }: OrderTrackingClientProps) {
  const router = useRouter();
  const { t } = useLanguage();

  // Store QR token
  useEffect(() => {
    if (token) {
      setQrToken(token);
    }
  }, [token]);

  const menuHref = `/${tenantSlug}/menu?table=${tableId}&token=${token}`;
  const billHref = `/${tenantSlug}/bill?table=${tableId}&token=${token}`;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 text-slate-900 dark:text-white transition-colors">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b border-gray-200 dark:border-slate-700/50 bg-gray-50/95 dark:bg-slate-900/95 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-2xl items-center justify-between px-4">
          <div className="flex items-center gap-3 overflow-hidden">
            <button
              onClick={() => router.push(menuHref)}
              className="flex size-10 shrink-0 items-center justify-center rounded-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-transparent transition hover:bg-gray-100 dark:hover:bg-slate-700"
            >
              <ArrowLeft className="size-5" />
            </button>
            <div className="flex flex-col min-w-0">
              <h1 className="truncate text-lg font-bold leading-tight">
                {tenantSlug}
              </h1>
              <p className="truncate text-xs font-medium text-emerald-600 dark:text-emerald-400">
                {t.checkout.table} {tableId}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <LanguageToggle />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-2xl pb-32">
        {/* Order Status Card */}
        <div className="p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-gray-200 dark:border-slate-700 flex justify-between items-start">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-xl font-bold">{mockOrderTracking.orderNumber}</h2>
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75" />
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
                  </span>
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {t.track.createdAt}: {mockOrderTracking.createdAt}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs font-bold text-emerald-500 uppercase tracking-wide">
                  {t.track.liveUpdate}
                </p>
                <p className="text-xs text-slate-400">{mockOrderTracking.updatedAt}</p>
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
      <div className="fixed bottom-0 left-0 right-0 w-full bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-slate-700/50 shadow-[0_-4px_20px_rgba(0,0,0,0.1)] z-40 pb-[calc(env(safe-area-inset-bottom,16px)+16px)]">
        <div className="mx-auto max-w-2xl p-4">
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
            <Link href={menuHref} className="flex-[2]">
              <Button className="w-full h-12 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-full shadow-md shadow-emerald-500/30">
                <Plus className="size-5 mr-2" />
                {t.order.addMoreItems}
              </Button>
            </Link>
          </div>
        </div>
      </div>
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
