"use client";

import { UtensilsCrossed } from "lucide-react";
import { useLanguage } from "@/lib/i18n/context";
import { formatVND } from "@/lib/format";
import type { OrderBatch, OrderItemStatus } from "@/lib/types/order-tracking";

interface BatchItemsListProps {
  batches: OrderBatch[];
}

export function BatchItemsList({ batches }: BatchItemsListProps) {
  const { t } = useLanguage();

  const getStatusInfo = (status: OrderItemStatus) => {
    switch (status) {
      case "pending":
        return { color: "bg-amber-400", label: t.track.pending || "Đang chờ" };
      case "preparing":
        return { color: "bg-orange-400", label: t.track.cooking };
      case "ready":
        return { color: "bg-blue-400", label: t.track.ready };
      case "served":
        return { color: "bg-emerald-500", label: t.track.served };
      case "cancelled":
        return { color: "bg-red-400", label: "Đã hủy" };
      default:
        return { color: "bg-gray-400", label: status };
    }
  };

  // Flatten all items from all batches
  const allItems = batches.flatMap((batch) => batch.items);
  const totalItems = allItems.length;

  return (
    <div>
      {/* Section Header */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
          Món ({totalItems})
        </h3>
      </div>

      {/* Items List - No per-item cards, just dividers */}
      <div className="bg-white dark:bg-slate-800 rounded-xl overflow-hidden">
        {allItems.map((item, index) => {
          const statusInfo = getStatusInfo(item.status);
          const isLast = index === allItems.length - 1;

          return (
            <div key={item.id}>
              <div className="flex items-center gap-3 p-3">
                {/* Small thumbnail */}
                <div className="size-10 rounded-lg bg-gray-100 dark:bg-slate-700 overflow-hidden shrink-0">
                  {item.image ? (
                    <div
                      className="h-full w-full bg-center bg-no-repeat bg-cover"
                      style={{ backgroundImage: `url("${item.image}")` }}
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center">
                      <UtensilsCrossed className="size-4 text-gray-300 dark:text-slate-500" />
                    </div>
                  )}
                </div>

                {/* Item details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-slate-900 dark:text-white text-sm truncate">
                        {item.quantity}× {item.name}
                      </p>
                      {item.modifiers && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                          {item.modifiers}
                        </p>
                      )}
                      {item.note && (
                        <p className="text-xs text-slate-400 dark:text-slate-500 italic mt-0.5">
                          "{item.note}"
                        </p>
                      )}
                    </div>
                    <span className="text-sm font-semibold text-slate-900 dark:text-white shrink-0">
                      {formatVND(item.price)}
                    </span>
                  </div>
                  
                  {/* Status chip */}
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className={`w-1.5 h-1.5 rounded-full ${statusInfo.color}`} />
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      {statusInfo.label}
                    </span>
                  </div>
                </div>
              </div>

              {/* Divider (except last) */}
              {!isLast && (
                <div className="mx-3 border-b border-gray-100 dark:border-slate-700" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
