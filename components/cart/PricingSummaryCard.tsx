'use client';

import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/lib/i18n/context';
import { formatVND } from '@/lib/format';

interface PricingSummaryCardProps {
  itemCount: number;
  subtotal: number;
  serviceCharge: number;
  tax: number;
  total: number;
  onPlaceOrder: () => void;
}

export function PricingSummaryCard({
  itemCount,
  subtotal,
  serviceCharge,
  tax,
  total,
  onPlaceOrder,
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
          <div className="flex justify-between text-sm text-slate-500 dark:text-slate-400">
            <span>{t.cart.serviceCharge} (5%)</span>
            <span className="font-medium text-slate-900 dark:text-white">
              {formatVND(serviceCharge)}
            </span>
          </div>
          <div className="flex justify-between text-sm text-slate-500 dark:text-slate-400">
            <span>{t.cart.tax}</span>
            <span className="font-medium text-slate-900 dark:text-white">
              {formatVND(tax)}
            </span>
          </div>
          
          <div className="my-4 border-t border-dashed border-gray-200 dark:border-slate-600" />
          
          <div className="flex justify-between items-end">
            <span className="text-base font-bold text-slate-900 dark:text-white">
              {t.cart.total}
            </span>
            <span className="text-2xl font-bold text-emerald-500">
              {formatVND(total)}
            </span>
          </div>
        </div>

        {/* Desktop Actions */}
        <div className="hidden lg:flex flex-col gap-3">
          <Button
            onClick={onPlaceOrder}
            className="w-full h-14 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl text-lg flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all hover:translate-y-[-2px]"
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
