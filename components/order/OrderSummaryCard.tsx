"use client";

import { useLanguage } from "@/lib/i18n/context";
import { useTenantSettings } from "@/providers/tenant-settings-context";
import type { OrderDTO } from "@/lib/types/order";

interface OrderSummaryCardProps {
  order: OrderDTO;
}

export function OrderSummaryCard({ order }: OrderSummaryCardProps) {
  const { t } = useLanguage();
  const {
    formatPrice,
    getServiceChargeRate,
    getTaxLabel,
    getTaxRate,
    isServiceChargeEnabled,
    settings,
  } = useTenantSettings();
  const scRate = getServiceChargeRate();
  const taxLabel = getTaxLabel();
  const taxRate = getTaxRate();

  return (
    <div>
      {/* Section Header */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
          Thanh toán
        </h3>
      </div>

      {/* Summary Content */}
      <div className="bg-white dark:bg-slate-800 rounded-xl p-4">
        {/* Line items */}
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-500 dark:text-slate-400">
              Tạm tính ({order.items.length} món)
            </span>
            <span className="font-medium text-slate-900 dark:text-white tabular-nums">
              {formatPrice(order.subtotal)}
            </span>
          </div>
          {isServiceChargeEnabled() && order.serviceCharge > 0 && (
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">
                {t.cart.serviceCharge} ({scRate}%)
              </span>
              <span className="font-medium text-slate-900 dark:text-white tabular-nums">
                {formatPrice(order.serviceCharge)}
              </span>
            </div>
          )}
          {order.discount && order.discount > 0 && (
            <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
              <span className="font-medium">
                Giảm giá {order.voucherCode && `(${order.voucherCode})`}
              </span>
              <span className="font-bold tabular-nums">
                -{formatPrice(order.discount)}
              </span>
            </div>
          )}
          {/* VAT line - show when tax is exclusive (not included in price) */}
          {!settings.tax.inclusive && order.tax > 0 && (
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">
                {taxLabel} ({taxRate}%)
              </span>
              <span className="font-medium text-slate-900 dark:text-white tabular-nums">
                {formatPrice(order.tax)}
              </span>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="my-3 border-t border-dashed border-gray-200 dark:border-slate-700" />

        {/* Total */}
        <div className="flex items-end justify-between">
          <div>
            <span className="text-base font-bold text-slate-900 dark:text-white">
              Tổng cộng
            </span>
            {settings.tax.inclusive && (
              <p className="text-xs text-slate-400">
                Đã gồm {taxLabel} {taxRate}%
              </p>
            )}
          </div>
          <span className="text-xl font-bold text-slate-900 dark:text-white tabular-nums">
            {formatPrice(order.total)}
          </span>
        </div>
      </div>
    </div>
  );
}
