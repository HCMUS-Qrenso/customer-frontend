'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Receipt, Lock, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LanguageProvider, useLanguage } from '@/lib/i18n/context';
import { LanguageToggle } from '@/components/LanguageToggle';
import { ThemeToggle } from '@/components/ThemeToggle';
import { formatVND } from '@/lib/format';
import { setQrToken } from '@/lib/stores/qr-token-store';
import type { BillDTO, PaymentMethod } from '@/lib/types/checkout';
import { MethodPicker } from '@/components/checkout/MethodPicker';
import { CardPanel } from '@/components/checkout/CardPanel';
import { OrderSummaryPanel } from '@/components/checkout/OrderSummaryPanel';

interface CheckoutClientProps {
  tenantSlug: string;
  tableId?: string;
  token?: string;
}

// Mock bill data
const mockBill: BillDTO = {
  id: 'bill-1',
  orderId: 'ord-1',
  orderNumber: 'A123',
  items: [
    { id: '1', name: 'Phở Bò Tái', price: 75000, quantity: 2, modifiers: 'Size Lớn' },
    { id: '2', name: 'Bánh Mì Thịt Nướng', price: 35000, quantity: 1 },
    { id: '3', name: 'Trà Đá', price: 10000, quantity: 3 },
  ],
  subtotal: 215000,
  serviceCharge: 10750,
  tax: 21500,
  total: 247250,
  status: 'unpaid',
};

function CheckoutContent({ tenantSlug, tableId, token }: CheckoutClientProps) {
  const router = useRouter();
  const { t } = useLanguage();
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('e-wallet');
  const [isProcessing, setIsProcessing] = useState(false);

  // Store QR token
  useEffect(() => {
    if (token) {
      setQrToken(token);
    }
  }, [token]);

  const cartHref = `/${tenantSlug}/cart?table=${tableId}&token=${token}`;
  const resultHref = `/${tenantSlug}/checkout/result?table=${tableId}&token=${token}`;

  // Calculate fees
  const cardFee = paymentMethod === 'card' ? Math.round(mockBill.total * 0.02) : 0;
  const total = mockBill.total + cardFee;

  const handlePayment = async () => {
    setIsProcessing(true);
    // Simulate payment processing
    await new Promise((r) => setTimeout(r, 1500));
    router.push(resultHref);
  };

  return (
    <div className="relative min-h-screen flex flex-col bg-gray-50 dark:bg-slate-900 text-slate-900 dark:text-white transition-colors">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-gray-50/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-gray-200 dark:border-slate-700/50 px-4 py-3 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href={cartHref}
              className="flex items-center justify-center w-10 h-10 rounded-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-transparent hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
            >
              <ArrowLeft className="size-5" />
            </Link>
            <div>
              <h1 className="text-lg font-bold leading-tight">{t.checkout.title}</h1>
              <p className="text-slate-500 dark:text-slate-400 text-xs font-medium">
                {t.checkout.table} {tableId}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <LanguageToggle />
            <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 rounded-full text-emerald-600 dark:text-emerald-400 font-bold text-sm">
              <Receipt className="size-4" />
              <span>
                {t.cart.total}: {formatVND(total)}
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-grow w-full max-w-7xl mx-auto p-4 lg:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 pb-32 lg:pb-8">
        {/* Left: Payment Process */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          {/* Progress Stepper */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-full">
              <span className="flex items-center justify-center w-5 h-5 bg-emerald-500 text-white rounded-full text-xs font-bold">
                1
              </span>
              <span className="text-sm font-medium">Method</span>
            </div>
            <div className="h-px w-8 bg-gray-300 dark:bg-slate-600" />
            <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-slate-400 rounded-full opacity-60">
              <span className="flex items-center justify-center w-5 h-5 bg-gray-200 dark:bg-slate-600 rounded-full text-xs font-bold">
                2
              </span>
              <span className="text-sm font-medium">Pay</span>
            </div>
          </div>

          <MethodPicker selectedMethod={paymentMethod} onSelect={setPaymentMethod} />

          {paymentMethod === 'card' && <CardPanel />}
        </div>

        {/* Right: Order Summary (Desktop) */}
        <div className="hidden lg:block lg:col-span-5">
          <OrderSummaryPanel
            items={mockBill.items}
            subtotal={mockBill.subtotal}
            serviceCharge={mockBill.serviceCharge}
            cardFee={cardFee}
            total={total}
            paymentMethod={paymentMethod}
            isProcessing={isProcessing}
            onConfirmPayment={handlePayment}
          />
        </div>
      </main>

      {/* Mobile Sticky Footer */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-slate-700/50 p-4 pb-[calc(env(safe-area-inset-bottom,16px)+16px)] shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-slate-500 dark:text-slate-400">{t.checkout.totalAmount}</span>
            <span className="text-xl font-bold">{formatVND(total)}</span>
          </div>
          <Button
            onClick={handlePayment}
            disabled={isProcessing}
            className="w-full h-12 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-full flex items-center justify-center gap-2 shadow-lg transition-all disabled:opacity-50"
          >
            {isProcessing ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                <span>{t.checkout.processing}</span>
              </>
            ) : (
              <>
                <Lock className="size-4" />
                <span>{t.checkout.confirmPayment}</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

export function CheckoutClient(props: CheckoutClientProps) {
  return (
    <LanguageProvider>
      <CheckoutContent {...props} />
    </LanguageProvider>
  );
}
