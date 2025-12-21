'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, CreditCard, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LanguageProvider, useLanguage } from '@/lib/i18n/context';
import { LanguageToggle } from '@/components/LanguageToggle';
import { ThemeToggle } from '@/components/ThemeToggle';
import { setQrToken } from '@/lib/stores/qr-token-store';
import type { BillDTO } from '@/lib/types/checkout';
import { BillItemsList } from '@/components/bill/BillItemsList';
import { BillSummaryCard } from '@/components/bill/BillSummaryCard';

interface BillClientProps {
  tenantSlug: string;
  tableId?: string;
  token?: string;
}

// Mock bill data with extended items
const mockBill: BillDTO & { items: (BillDTO['items'][0] & { image?: string; note?: string; addedAt: string })[] } = {
  id: 'bill-1',
  orderId: 'ord-1',
  orderNumber: 'A123',
  items: [
    {
      id: '1',
      name: 'Phở Bò Tái',
      nameEn: 'Rare Beef Pho',
      price: 75000,
      quantity: 2,
      modifiers: 'Size Lớn, Thêm thịt',
      image: 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=400',
      addedAt: new Date(Date.now() - 30 * 60000).toISOString(),
    },
    {
      id: '2',
      name: 'Bánh Mì Thịt Nướng',
      nameEn: 'Grilled Pork Banh Mi',
      price: 35000,
      quantity: 1,
      image: 'https://images.unsplash.com/photo-1600688640154-9619e002df30?w=400',
      addedAt: new Date(Date.now() - 30 * 60000).toISOString(),
    },
    {
      id: '3',
      name: 'Trà Đá',
      nameEn: 'Iced Tea',
      price: 10000,
      quantity: 3,
      note: 'Ít đường',
      addedAt: new Date(Date.now() - 15 * 60000).toISOString(),
    },
  ],
  subtotal: 215000,
  serviceCharge: 10750,
  tax: 0,
  total: 225750,
  status: 'unpaid',
};

function formatTime(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

function BillContent({ tenantSlug, tableId, token }: BillClientProps) {
  const router = useRouter();
  const { t } = useLanguage();

  // Store QR token
  useEffect(() => {
    if (token) {
      setQrToken(token);
    }
  }, [token]);

  const menuHref = `/${tenantSlug}/menu?table=${tableId}&token=${token}`;
  const checkoutHref = `/${tenantSlug}/checkout?table=${tableId}&token=${token}`;

  return (
    <div className="relative flex min-h-screen flex-col overflow-x-hidden bg-gray-50 dark:bg-slate-900 text-slate-900 dark:text-white transition-colors">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b border-gray-200 dark:border-slate-700/50 bg-gray-50/95 dark:bg-slate-900/95 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 lg:px-8">
          <div className="flex items-center gap-3 overflow-hidden">
            <button
              onClick={() => router.back()}
              className="flex size-10 shrink-0 items-center justify-center rounded-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-transparent transition hover:bg-gray-100 dark:hover:bg-slate-700"
            >
              <ArrowLeft className="size-5" />
            </button>
            <div className="flex flex-col min-w-0">
              <h1 className="truncate text-lg font-bold leading-tight">{t.bill.title}</h1>
              <p className="truncate text-xs font-medium text-emerald-600 dark:text-emerald-400">
                {tenantSlug} • {t.checkout.table} {tableId}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <LanguageToggle />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 pb-40 lg:pb-12">
        <div className="mx-auto max-w-7xl px-4 py-6 lg:px-8">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-10">
            {/* Left: Bill Items */}
            <div className="flex flex-col gap-6 lg:col-span-7 xl:col-span-8">
              {/* Order Status Card */}
              <div className="rounded-xl bg-white dark:bg-slate-800 p-5 shadow-sm border border-gray-200 dark:border-slate-700">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                      {t.bill.orderId}
                    </p>
                    <h2 className="text-2xl font-bold tracking-tight">{mockBill.orderNumber}</h2>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 rounded-full bg-emerald-500/20 px-3 py-1.5 text-emerald-600 dark:text-emerald-400">
                      <span className="relative flex size-2.5">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75" />
                        <span className="relative inline-flex size-2.5 rounded-full bg-emerald-500" />
                      </span>
                      <span className="text-sm font-bold">{t.bill.dining}</span>
                    </div>
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      {t.bill.updated} {formatTime(mockBill.items[0].addedAt)}
                    </span>
                  </div>
                </div>
              </div>

              <BillItemsList items={mockBill.items} />
            </div>

            {/* Right: Summary */}
            <div className="lg:col-span-5 xl:col-span-4">
              <BillSummaryCard bill={mockBill} menuHref={menuHref} checkoutHref={checkoutHref} />
            </div>
          </div>
        </div>
      </main>

      {/* Mobile Sticky Action Bar */}
      <div className="fixed bottom-0 left-0 z-40 w-full border-t border-gray-200 dark:border-slate-700/50 bg-white dark:bg-slate-900 px-4 py-4 pb-[calc(env(safe-area-inset-bottom,16px)+16px)] lg:hidden shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        <div className="mx-auto flex max-w-lg flex-col gap-3">
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
          <Link href={menuHref} className="text-center text-xs font-bold text-emerald-600 dark:text-emerald-400">
            {t.cart.backToMenu}
          </Link>
        </div>
      </div>
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
