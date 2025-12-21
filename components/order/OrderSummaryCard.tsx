'use client';

import Link from 'next/link';
import { Receipt } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/lib/i18n/context';
import { formatVND } from '@/lib/format';
import type { OrderDTO } from '@/lib/types/order';

interface OrderSummaryCardProps {
  order: OrderDTO;
  billHref: string;
  menuHref: string;
}

export function OrderSummaryCard({ order, billHref, menuHref }: OrderSummaryCardProps) {
  const { t } = useLanguage();

  return (
    <div className="lg:sticky lg:top-24 flex flex-col gap-6">
      <div className="flex flex-col gap-4 rounded-xl bg-white dark:bg-slate-800 p-6 shadow-sm border border-gray-200 dark:border-slate-700">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">{t.bill.paymentSummary}</h3>
        
        <div className="flex flex-col gap-3 border-b border-dashed border-gray-200 dark:border-slate-600 pb-4">
          <div className="flex justify-between text-sm">
            <span className="text-slate-500 dark:text-slate-400">
              {t.cart.subtotal} ({order.items.length} {t.cart.items})
            </span>
            <span className="font-medium text-slate-900 dark:text-white">{formatVND(order.subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-500 dark:text-slate-400">{t.cart.serviceCharge} (5%)</span>
            <span className="font-medium text-slate-900 dark:text-white">{formatVND(order.serviceCharge)}</span>
          </div>
          {order.discount && order.discount > 0 && (
            <div className="flex justify-between text-sm text-emerald-600 dark:text-emerald-400">
              <span className="font-medium">
                {t.bill.voucher} ({order.voucherCode})
              </span>
              <span className="font-bold">-{formatVND(order.discount)}</span>
            </div>
          )}
        </div>
        
        <div className="flex items-end justify-between pt-1">
          <div className="flex flex-col">
            <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
              {t.checkout.totalAmount}
            </span>
            <span className="text-xs text-slate-400">{t.bill.inclTaxes}</span>
          </div>
          <span className="text-2xl font-bold text-slate-900 dark:text-white">{formatVND(order.total)}</span>
        </div>

        {/* Desktop Actions */}
        <div className="hidden lg:flex flex-col gap-3 mt-2">
          <Link href={billHref}>
            <Button className="w-full h-12 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-full flex items-center justify-center gap-2 shadow-sm">
              <Receipt className="size-5" />
              {t.order.requestBill}
            </Button>
          </Link>
          <Link
            href={menuHref}
            className="mt-2 text-center text-sm font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
          >
            {t.order.addMoreItems}
          </Link>
        </div>
      </div>
    </div>
  );
}
