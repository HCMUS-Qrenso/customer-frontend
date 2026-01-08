"use client";

import { Clock } from "lucide-react";
import { useLanguage } from "@/lib/i18n/context";
import { useTenantSettings } from "@/providers/tenant-settings-context";
import type { BillItemDTO } from "@/lib/types/checkout";

interface BillItemsListProps {
  items: (BillItemDTO & { image?: string; note?: string; addedAt: string })[];
}

export function BillItemsList({ items }: BillItemsListProps) {
  const { t, lang } = useLanguage();
  const { formatPrice, formatTime } = useTenantSettings();

  // Group items by addedAt time
  const grouped = items.reduce(
    (acc, item) => {
      const time = formatTime(item.addedAt);
      if (!acc[time]) acc[time] = [];
      acc[time].push(item);
      return acc;
    },
    {} as Record<string, typeof items>,
  );

  return (
    <div className="flex flex-col gap-6">
      {Object.entries(grouped).map(([time, groupItems]) => (
        <div key={time} className="flex flex-col gap-4">
          <div className="flex items-center gap-2 px-1">
            <Clock className="size-4 text-slate-400 dark:text-slate-500" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {t.bill.addedAt} {time}
            </h3>
          </div>

          {groupItems.map((item) => {
            const name = lang === "en" && item.nameEn ? item.nameEn : item.name;

            return (
              <div
                key={item.id}
                className="group relative flex flex-col gap-4 rounded-xl bg-white dark:bg-slate-800 p-4 shadow-sm border border-gray-200 dark:border-slate-700 transition hover:shadow-md sm:flex-row sm:items-start"
              >
                {item.image && (
                  <div className="relative aspect-square size-[80px] shrink-0 overflow-hidden rounded-lg bg-gray-100 dark:bg-slate-700 sm:size-[90px]">
                    <div
                      className="h-full w-full bg-cover bg-center"
                      style={{ backgroundImage: `url('${item.image}')` }}
                    />
                  </div>
                )}
                <div className="flex flex-1 flex-col justify-between gap-2 sm:gap-1">
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <h4 className="text-base font-bold text-slate-900 dark:text-white">
                        {name}
                      </h4>
                      {item.modifiers && (
                        <div className="mt-1 flex flex-wrap gap-2">
                          {item.modifiers.split(", ").map((mod, i) => (
                            <span
                              key={i}
                              className="inline-flex items-center rounded bg-gray-100 dark:bg-slate-700 px-2 py-0.5 text-xs font-medium text-slate-500 dark:text-slate-400"
                            >
                              {mod}
                            </span>
                          ))}
                        </div>
                      )}
                      {item.note && (
                        <p className="mt-2 text-sm italic text-gray-400">
                          &quot;{item.note}&quot;
                        </p>
                      )}
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-base font-bold text-slate-900 dark:text-white">
                        {formatPrice(item.price * item.quantity)}
                      </p>
                    </div>
                  </div>
                  <div className="mt-2 flex items-center justify-between border-t border-dashed border-gray-200 dark:border-slate-600 pt-2">
                    <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                      x{item.quantity} {t.cart.items}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {formatPrice(item.price)} / {t.bill.each}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
