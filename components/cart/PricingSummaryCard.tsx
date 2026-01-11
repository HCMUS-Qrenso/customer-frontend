"use client";

import { ArrowRight, Info, Loader2, Ticket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/i18n/context";
import { useTenantSettings } from "@/providers/tenant-settings-context";
import type { AppliedVoucher } from "@/lib/api/voucher";

interface PricingSummaryCardProps {
  itemCount: number;
  subtotal: number;
  discount?: number;
  appliedVoucher?: AppliedVoucher | null;
  onPlaceOrder: () => void;
  isLoading?: boolean;
  disabled?: boolean;
}

export function PricingSummaryCard({
  itemCount,
  subtotal,
  discount = 0,
  appliedVoucher,
  onPlaceOrder,
  isLoading = false,
  disabled = false,
}: PricingSummaryCardProps) {
  const { t } = useLanguage();
  const { formatPrice } = useTenantSettings();

  const total = subtotal - discount;
  const hasDiscount = discount > 0 && appliedVoucher;

  return (
    <div className="lg:sticky lg:top-24">
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-slate-700/50">
        <h2 className="text-xl font-bold mb-6 text-slate-900 dark:text-white">
          {t.cart.orderSummary}
        </h2>

        <div className="space-y-3 mb-6">
          {/* Subtotal */}
          <div className="flex justify-between text-sm text-slate-500 dark:text-slate-400">
            <span>
              {t.cart.subtotal} ({itemCount} {t.cart.items})
            </span>
            <span className="font-medium text-slate-900 dark:text-white">
              {formatPrice(subtotal)}
            </span>
          </div>

          {/* Voucher Discount */}
          {hasDiscount && (
            <div className="flex justify-between text-sm">
              <div className="flex items-center gap-1.5 text-green-600 dark:text-green-400">
                <Ticket className="size-3.5" />
                <span>{appliedVoucher.name}</span>
              </div>
              <span className="font-medium text-green-600 dark:text-green-400">
                -{formatPrice(discount)}
              </span>
            </div>
          )}

          <div className="my-4 border-t border-dashed border-gray-200 dark:border-slate-600" />

          {/* Total */}
          <div className="flex justify-between items-end">
            <div className="flex flex-col gap-1">
              <span className="text-base font-bold text-slate-900 dark:text-white">
                {hasDiscount ? (t.cart.subtotal) : t.cart.subtotal}
              </span>
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <Info className="size-3" />
                {t.cart?.taxNote || "Taxes & fees will be calculated at checkout"}
              </span>
            </div>
            <div className="text-right">
              {hasDiscount && (
                <span className="text-sm text-slate-400 line-through mr-2">
                  {formatPrice(subtotal)}
                </span>
              )}
              <span className="text-2xl font-bold text-emerald-500">
                {formatPrice(total)}
              </span>
            </div>
          </div>
        </div>

        {/* Desktop Actions */}
        <div className="hidden lg:flex flex-col gap-3">
          <Button
            onClick={onPlaceOrder}
            disabled={isLoading || disabled}
            className="w-full h-14 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl text-lg flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all hover:translate-y-[-2px] disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="size-5 animate-spin" />
                <span>{t.misc?.processing || "Processing..."}</span>
              </>
            ) : (
              <span>{t.cart.placeOrder}</span>
            )}
            <ArrowRight className="size-5" />
          </Button>
          <p className="text-center text-xs text-slate-400 mt-2">
            {t.cart.termsAgreement}
          </p>
        </div>
      </div>
    </div>
  );
}
