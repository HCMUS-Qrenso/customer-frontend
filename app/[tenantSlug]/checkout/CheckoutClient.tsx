"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Receipt, Lock, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LanguageProvider, useLanguage } from "@/lib/i18n/context";
import { useQrToken } from "@/hooks/use-qr-token";
import { getQrToken, getTableId } from "@/lib/stores/qr-token-store";
import { decodeQrToken } from "@/lib/utils/jwt-decode";
import { mockCheckoutBill as mockBill } from "@/lib/mocks";
import type { BillDTO, PaymentMethod } from "@/lib/types/checkout";
import { MethodPicker } from "@/components/checkout/MethodPicker";
import { CardPanel } from "@/components/checkout/CardPanel";
import { OrderSummaryPanel } from "@/components/checkout/OrderSummaryPanel";
import { PageHeader } from "@/components/shared/PageHeader";
import { MobileStickyBar } from "@/components/shared/MobileStickyBar";
import { UserAvatar } from "@/components/auth/UserAvatar";
import { useTenantSettings } from "@/providers/tenant-settings-context";

interface CheckoutClientProps {
  tenantSlug: string;
  tableId?: string;
  token?: string;
}

function CheckoutContent({
  tenantSlug,
  tableId: propsTableId,
  token: propsToken,
}: CheckoutClientProps) {
  const router = useRouter();
  const { t } = useLanguage();
  const { formatPrice } = useTenantSettings();
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("e-wallet");
  const [isProcessing, setIsProcessing] = useState(false);

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
  const cartHref = `/${tenantSlug}/cart`;
  const resultHref = `/${tenantSlug}/checkout/result`;

  // Calculate fees
  const cardFee =
    paymentMethod === "card" ? Math.round(mockBill.total * 0.02) : 0;
  const total = mockBill.total + cardFee;

  const handlePayment = async () => {
    setIsProcessing(true);
    // Simulate payment processing
    await new Promise((r) => setTimeout(r, 1500));
    router.push(resultHref);
  };

  return (
    <div className="relative min-h-screen flex flex-col bg-gray-50 dark:bg-slate-900 text-slate-900 dark:text-white transition-colors">
      <PageHeader
        title={t.checkout.title}
        subtitle={
          tableNumber ? `${t.checkout.table} ${tableNumber}` : tenantSlug
        }
        backHref={cartHref}
        rightContent={
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 rounded-full text-emerald-600 dark:text-emerald-400 font-bold text-sm">
              <Receipt className="size-4" />
              <span>
                {t.cart.total}: {formatPrice(total)}
              </span>
            </div>
            <UserAvatar />
          </div>
        }
      />

      <main className="grow w-full max-w-7xl mx-auto p-4 lg:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 pb-32 lg:pb-8">
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

          <MethodPicker
            selectedMethod={paymentMethod}
            onSelect={setPaymentMethod}
          />

          {paymentMethod === "card" && <CardPanel />}
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
      <MobileStickyBar>
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-slate-500 dark:text-slate-400">
            {t.checkout.totalAmount}
          </span>
          <span className="text-xl font-bold">{formatPrice(total)}</span>
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
      </MobileStickyBar>
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
