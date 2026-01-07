"use client";

import { Receipt, Lock, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/i18n/context";
import { useTenantSettings } from "@/providers/tenant-settings-context";
import type { BillItemDTO, PaymentMethod } from "@/lib/types/checkout";

interface OrderSummaryPanelProps {
  items: BillItemDTO[];
  subtotal: number;
  serviceCharge: number;
  cardFee: number;
  total: number;
  paymentMethod: PaymentMethod;
  isProcessing: boolean;
  onConfirmPayment: () => void;
}

export function OrderSummaryPanel({
  items,
  subtotal,
  serviceCharge,
  cardFee,
  total,
  paymentMethod,
  isProcessing,
  onConfirmPayment,
}: OrderSummaryPanelProps) {
  const { t } = useLanguage();
  const { formatPrice, getServiceChargeRate, isServiceChargeEnabled } = useTenantSettings();
  const scRate = getServiceChargeRate();

  return (
    <div className="sticky top-24 space-y-4">
      <div className="rounded-2xl bg-white dark:bg-slate-800 p-6 shadow-sm border border-gray-200 dark:border-slate-700">
        <h2 className="text-lg font-bold mb-6 pb-4 border-b border-dashed border-gray-200 dark:border-slate-600 text-slate-900 dark:text-white">
          {t.cart.orderSummary}
        </h2>

        {/* Line Items */}
        <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex justify-between items-start gap-4"
            >
              <div className="flex items-center justify-center w-6 h-6 rounded bg-gray-100 dark:bg-slate-700 text-xs font-bold text-slate-900 dark:text-white">
                {item.quantity}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-900 dark:text-white">
                  {item.name}
                </p>
                {item.modifiers && (
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {item.modifiers}
                  </p>
                )}
              </div>
              <p className="text-sm font-bold text-slate-900 dark:text-white">
                {formatPrice(item.price * item.quantity)}
              </p>
            </div>
          ))}
        </div>

        {/* Calculations */}
        <div className="mt-6 space-y-2 pt-4 border-t border-dashed border-gray-200 dark:border-slate-600">
          <div className="flex justify-between text-sm">
            <span className="text-slate-500 dark:text-slate-400">
              {t.cart.subtotal}
            </span>
            <span className="font-medium text-slate-900 dark:text-white">
              {formatPrice(subtotal)}
            </span>
          </div>
          {isServiceChargeEnabled() && serviceCharge > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-slate-500 dark:text-slate-400">
                {t.cart.serviceCharge} ({scRate}%)
              </span>
              <span className="font-medium text-slate-900 dark:text-white">
                {formatPrice(serviceCharge)}
              </span>
            </div>
          )}
          {paymentMethod === "card" && cardFee > 0 && (
            <div className="flex justify-between text-sm text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/10 -mx-2 px-2 py-1 rounded">
              <span>{t.checkout.processingFee} (2%)</span>
              <span className="font-medium">+{formatPrice(cardFee)}</span>
            </div>
          )}
        </div>

        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-slate-600">
          <div className="flex justify-between items-end">
            <span className="text-base font-bold text-slate-900 dark:text-white">
              {t.checkout.totalAmount}
            </span>
            <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              {formatPrice(total)}
            </span>
          </div>
        </div>

        {/* Desktop CTA */}
        <Button
          onClick={onConfirmPayment}
          disabled={isProcessing}
          className="mt-6 w-full h-14 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl text-lg flex items-center justify-center gap-2 shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isProcessing ? (
            <>
              <Loader2 className="size-5 animate-spin" />
              <span>{t.checkout.processing}</span>
            </>
          ) : (
            <>
              <Lock className="size-5" />
              <span>{t.checkout.confirmPayment}</span>
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
