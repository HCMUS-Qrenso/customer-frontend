"use client";

import { LiveIndicator } from "./LiveIndicator";

interface OrderStatusCardProps {
  orderLabel: string;
  orderNumber: string;
  statusLabel: string;
  updatedAt?: string;
  updatedLabel?: string;
  showLiveIndicator?: boolean;
}

/**
 * Card displaying order number with live status indicator
 * Used in Bill, Order pages
 */
export function OrderStatusCard({
  orderLabel,
  orderNumber,
  statusLabel,
  updatedAt,
  updatedLabel,
  showLiveIndicator = true,
}: OrderStatusCardProps) {
  return (
    <div className="rounded-xl bg-white dark:bg-slate-800 p-5 shadow-sm border border-gray-200 dark:border-slate-700">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
            {orderLabel}
          </p>
          <h2 className="text-2xl font-bold tracking-tight">{orderNumber}</h2>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-full bg-emerald-500/20 px-3 py-1.5 text-emerald-600 dark:text-emerald-400">
            {showLiveIndicator && <LiveIndicator size="sm" />}
            <span className="text-sm font-bold">{statusLabel}</span>
          </div>
          {updatedAt && (
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {updatedLabel} {updatedAt}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
