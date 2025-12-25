"use client";

import Link from "next/link";
import { CreditCard, Store, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/i18n/context";
import { formatVND } from "@/lib/format";
import type { BillDTO } from "@/lib/types/checkout";

interface BillSummaryCardProps {
  bill: BillDTO;
  menuHref: string;
  checkoutHref: string;
}

export function BillSummaryCard({
  bill,
  menuHref,
  checkoutHref,
}: BillSummaryCardProps) {
  const { t } = useLanguage();

  return (
    <div className="lg:sticky lg:top-24 flex flex-col gap-6">
      <div className="flex flex-col gap-4 rounded-xl bg-white dark:bg-slate-800 p-6 shadow-sm border border-gray-200 dark:border-slate-700">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">
          {t.bill.paymentSummary}
        </h3>

        <div className="flex flex-col gap-3 border-b border-dashed border-gray-200 dark:border-slate-600 pb-4">
          <div className="flex justify-between text-sm">
            <span className="text-slate-500 dark:text-slate-400">
              {t.cart.subtotal} ({bill.items.length} {t.cart.items})
            </span>
            <span className="font-medium text-slate-900 dark:text-white">
              {formatVND(bill.subtotal)}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-500 dark:text-slate-400">
              {t.cart.serviceCharge} (5%)
            </span>
            <span className="font-medium text-slate-900 dark:text-white">
              {formatVND(bill.serviceCharge)}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-500 dark:text-slate-400">
              {t.bill.vat}
            </span>
            <span className="font-medium text-slate-400">--</span>
          </div>
          {bill.discount && bill.discount > 0 && (
            <div className="flex justify-between text-sm text-emerald-600 dark:text-emerald-400">
              <span className="font-medium">
                {t.bill.voucher} ({bill.voucherCode})
              </span>
              <span className="font-bold">-{formatVND(bill.discount)}</span>
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
          <span className="text-2xl font-bold text-slate-900 dark:text-white">
            {formatVND(bill.total)}
          </span>
        </div>

        {/* Info Text */}
        <div className="rounded-lg bg-blue-50 dark:bg-blue-900/20 p-3">
          <div className="flex gap-2">
            <Info className="size-4 text-blue-500 shrink-0 mt-0.5" />
            <p className="text-xs leading-relaxed text-blue-700 dark:text-blue-200">
              {t.bill.billInfoText}
            </p>
          </div>
        </div>

        {/* Desktop Actions */}
        <div className="hidden lg:flex flex-col gap-3 mt-2">
          <Link href={checkoutHref}>
            <Button className="w-full h-12 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-full flex items-center justify-center gap-2 shadow-sm">
              <CreditCard className="size-5" />
              {t.bill.payNow}
            </Button>
          </Link>
          <Button
            variant="outline"
            className="w-full h-12 border-emerald-500/20 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 font-bold rounded-full flex items-center justify-center gap-2"
          >
            <Store className="size-5" />
            {t.bill.payCounter}
          </Button>
          <Link
            href={menuHref}
            className="mt-2 text-center text-sm font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
          >
            {t.cart.backToMenu}
          </Link>
        </div>
      </div>
    </div>
  );
}
