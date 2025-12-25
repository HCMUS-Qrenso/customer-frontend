"use client";

import { useLanguage } from "@/lib/i18n/context";
import { formatVND } from "@/lib/format";

type ItemStatus = "preparing" | "ready" | "served";

interface BatchItem {
  id: string;
  name: string;
  nameEn?: string;
  quantity: number;
  price: number;
  image?: string;
  modifiers?: string;
  status: ItemStatus;
}

interface Batch {
  id: string;
  batchNumber: number;
  createdAt: string;
  itemCount: number;
  status: ItemStatus;
  items: BatchItem[];
}

interface BatchItemsListProps {
  batches: Batch[];
}

export function BatchItemsList({ batches }: BatchItemsListProps) {
  const { t, lang } = useLanguage();

  const getStatusInfo = (status: ItemStatus) => {
    switch (status) {
      case "preparing":
        return {
          color: "bg-orange-400",
          textColor: "text-orange-500",
          label: t.track.cooking,
        };
      case "ready":
        return {
          color: "bg-blue-400",
          textColor: "text-blue-500",
          label: t.track.ready,
        };
      case "served":
        return {
          color: "bg-emerald-500",
          textColor: "text-emerald-500",
          label: t.track.served,
        };
    }
  };

  return (
    <div className="flex flex-col">
      {batches.map((batch, index) => (
        <div key={batch.id} className={index > 0 ? "opacity-70" : ""}>
          {/* Batch Header */}
          <div className="px-4 pt-4 pb-2 flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              {t.track.batch} {batch.batchNumber} • {batch.createdAt}
            </h3>
            <span className="text-xs font-medium text-slate-500 bg-gray-100 dark:bg-slate-700 px-2 py-1 rounded-full">
              {batch.itemCount} {t.cart.items}
            </span>
          </div>

          {/* Batch Items */}
          <div className="flex flex-col gap-2 px-4">
            {batch.items.map((item) => {
              const statusInfo = getStatusInfo(item.status);
              const name =
                lang === "en" && item.nameEn ? item.nameEn : item.name;

              return (
                <div
                  key={item.id}
                  className="flex gap-4 bg-white dark:bg-slate-800 p-3 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm"
                >
                  {item.image && (
                    <div
                      className="bg-center bg-no-repeat aspect-square bg-cover rounded-lg size-[70px] shrink-0"
                      style={{ backgroundImage: `url("${item.image}")` }}
                    />
                  )}
                  <div className="flex flex-1 flex-col justify-between py-0.5">
                    <div className="flex justify-between items-start">
                      <p className="text-base font-bold text-slate-900 dark:text-white line-clamp-1">
                        {item.quantity}x {name}
                      </p>
                      <span className="text-sm font-bold text-slate-900 dark:text-white ml-2">
                        {formatVND(item.price)}
                      </span>
                    </div>
                    {item.modifiers && (
                      <div className="flex flex-wrap gap-1.5 my-1">
                        {item.modifiers.split(", ").map((mod, i) => (
                          <span
                            key={i}
                            className="text-[10px] font-medium px-2 py-0.5 bg-gray-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-full"
                          >
                            {mod}
                          </span>
                        ))}
                      </div>
                    )}
                    <div className="flex items-center gap-1.5 mt-1">
                      <span
                        className={`flex h-2 w-2 rounded-full ${statusInfo.color}`}
                      />
                      <span
                        className={`text-xs font-medium ${statusInfo.textColor}`}
                      >
                        {statusInfo.label}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
