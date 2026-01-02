"use client";

import { useState } from "react";
import Link from "next/link";
import { X, Check, AlertTriangle, Receipt, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LanguageProvider, useLanguage } from "@/lib/i18n/context";
import { formatVND } from "@/lib/format";
import { useQrToken } from "@/hooks/use-qr-token";
import { getQrToken, getTableId } from "@/lib/stores/qr-token-store";
import { mockCheckoutResult as mockResult } from "@/lib/mocks";
import type { CheckoutResultDTO } from "@/lib/types/checkout";

interface CheckoutResultClientProps {
  tenantSlug: string;
  tableId?: string;
  token?: string;
}

function formatDateTime(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function CheckoutResultContent({
  tenantSlug,
  tableId: propsTableId,
  token: propsToken,
}: CheckoutResultClientProps) {
  const { t } = useLanguage();
  const [result] = useState<CheckoutResultDTO>(mockResult);

  // Use props or fallback to persisted values from sessionStorage
  const tableId = propsTableId || getTableId() || undefined;
  const token = propsToken || getQrToken() || undefined;

  // Store QR token and tableId
  useQrToken(token, tableId);

  // URLs (no need to include table/token params - they're in storage)
  const menuHref = `/${tenantSlug}/menu`;
  const orderHref = `/${tenantSlug}/my-order`;

  // Failed state
  if (!result.success) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-24 h-24 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="size-12 text-red-500" />
          </div>
          <h1 className="text-2xl font-bold mb-2 text-slate-900 dark:text-white">
            {t.checkout.paymentFailed}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mb-8">
            {result.error}
          </p>
          <Link href={menuHref}>
            <Button className="h-12 px-8 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-full">
              Try Again
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 dark:bg-slate-950 flex items-center justify-center min-h-screen p-0 sm:p-4">
      <div className="relative w-full max-w-[480px] h-full sm:h-auto min-h-screen sm:min-h-[800px] bg-gray-50 dark:bg-slate-900 sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <header className="flex items-center justify-between px-6 py-5 z-20">
          <div className="w-10" />
          <h1 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
            {t.checkout.title}
          </h1>
          <Link
            href={menuHref}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-white dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
          >
            <X className="size-5 text-slate-900 dark:text-white" />
          </Link>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto no-scrollbar flex flex-col items-center px-6 pb-8">
          {/* Hero */}
          <div className="flex flex-col items-center justify-center py-8 w-full animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="relative mb-6">
              <div className="w-24 h-24 bg-emerald-500 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(16,185,129,0.3)]">
                <Check className="size-12 text-white" strokeWidth={3} />
              </div>
              <div className="absolute top-0 right-0 w-3 h-3 bg-blue-400 rounded-full opacity-60 animate-bounce" />
              <div className="absolute bottom-2 left-0 w-2 h-2 bg-yellow-400 rounded-full opacity-80 animate-pulse" />
            </div>
            <h2 className="text-2xl font-bold text-center mb-1 text-slate-900 dark:text-white">
              {t.checkout.paymentSuccess}
            </h2>
            <div className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-4">
              {t.checkout.transactionId}: {result.transactionId}
            </div>
            <div className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              {formatVND(result.amountPaid || 0)}
            </div>
          </div>

          {/* Receipt Preview */}
          <div className="w-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl p-5 mb-8 shadow-sm">
            <div className="flex justify-between items-start mb-4 border-b border-gray-200 dark:border-slate-600 pb-4">
              <div className="flex flex-col">
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider mb-1">
                  Total Paid
                </span>
                <span className="text-lg font-bold text-slate-900 dark:text-white">
                  {formatVND(result.amountPaid || 0)}
                </span>
              </div>
              <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-400">
                <Receipt className="size-5" />
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500 dark:text-slate-400">
                  Date & Time
                </span>
                <span className="font-medium text-slate-900 dark:text-white">
                  {formatDateTime(result.timestamp || new Date().toISOString())}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500 dark:text-slate-400">
                  Payment Method
                </span>
                <span className="font-medium text-slate-900 dark:text-white">
                  {result.paymentMethod === "card"
                    ? "Card •• 4242"
                    : result.paymentMethod}
                </span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="w-full space-y-3 mt-auto">
            <Button className="w-full h-14 bg-emerald-500 hover:bg-emerald-600 active:scale-[0.98] transition-all rounded-full flex items-center justify-center gap-2 shadow-lg">
              <Receipt className="size-5 text-white" />
              <span className="text-white font-bold text-base">
                {t.checkout.viewReceipt}
              </span>
            </Button>
            <Link
              href={orderHref}
              className="w-full h-14 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700 active:scale-[0.98] transition-all rounded-full flex items-center justify-center gap-2"
            >
              <span className="font-bold text-base text-slate-900 dark:text-white">
                {t.checkout.trackOrderStatus}
              </span>
              <ArrowRight className="size-5 text-slate-900 dark:text-white" />
            </Link>
            <Link
              href={menuHref}
              className="w-full h-12 flex items-center justify-center mt-2 group"
            >
              <span className="text-slate-500 group-hover:text-slate-900 dark:group-hover:text-white font-semibold text-sm transition-colors">
                {t.checkout.returnToMenu}
              </span>
            </Link>
          </div>
        </main>
      </div>
    </div>
  );
}

export function CheckoutResultClient(props: CheckoutResultClientProps) {
  return (
    <LanguageProvider>
      <CheckoutResultContent {...props} />
    </LanguageProvider>
  );
}
