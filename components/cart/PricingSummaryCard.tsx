"use client";

import { ArrowRight, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/i18n/context";
import { formatVND } from "@/lib/format";

interface PricingSummaryCardProps {
  itemCount: number;
  subtotal: number;
  onPlaceOrder: () => void;
  isLoading?: boolean;
}

export function PricingSummaryCard({
  itemCount,
  subtotal,
  onPlaceOrder,
  isLoading = false,
}: PricingSummaryCardProps) {
  const { t } = useLanguage();

  return (
    <div className="lg:sticky lg:top-24">
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-slate-700/50">
        <h2 className="text-xl font-bold mb-6 text-slate-900 dark:text-white">
          {t.cart.orderSummary}
        </h2>

        <div className="space-y-3 mb-6">
          <div className="flex justify-between text-sm text-slate-500 dark:text-slate-400">
            <span>
              {t.cart.subtotal} ({itemCount} {t.cart.items})
            </span>
            <span className="font-medium text-slate-900 dark:text-white">
              {formatVND(subtotal)}
            </span>
          </div>

          <div className="my-4 border-t border-dashed border-gray-200 dark:border-slate-600" />

          <div className="flex justify-between items-end">
            <div className="flex flex-col gap-1">
              <span className="text-base font-bold text-slate-900 dark:text-white">
                {t.cart.subtotal}
              </span>
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <Info className="size-3" />
                Thuế, phí sẽ tính khi thanh toán
              </span>
            </div>
            <span className="text-2xl font-bold text-emerald-500">
              {formatVND(subtotal)}
            </span>
          </div>
        </div>

        {/* Desktop Actions */}
        <div className="hidden lg:flex flex-col gap-3">
          <Button
            onClick={onPlaceOrder}
            disabled={isLoading}
            className="w-full h-14 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl text-lg flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all hover:translate-y-[-2px] disabled:opacity-50"
          >
            <span>{t.cart.placeOrder}</span>
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
