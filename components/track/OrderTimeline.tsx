"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { useLanguage } from "@/lib/i18n/context";

interface TimelineEntry {
  time: string;
  message: string;
}

interface OrderTimelineProps {
  entries: TimelineEntry[];
}

export function OrderTimeline({ entries }: OrderTimelineProps) {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="px-4 mt-8">
      <details
        className="group bg-gray-100 dark:bg-slate-800/50 rounded-xl overflow-hidden border border-gray-200 dark:border-slate-700"
        open={isOpen}
        onToggle={(e) => setIsOpen((e.target as HTMLDetailsElement).open)}
      >
        <summary className="flex justify-between items-center p-4 cursor-pointer font-bold text-slate-900 dark:text-white select-none">
          <span>
            {t.track.orderUpdates} ({entries.length})
          </span>
          <ChevronDown
            className={`size-5 transition-transform ${isOpen ? "rotate-180" : ""}`}
          />
        </summary>
        <div className="px-4 pb-4">
          <div className="relative pl-4 border-l-2 border-gray-200 dark:border-slate-600 space-y-6">
            {entries.map((entry, index) => (
              <div key={index} className="relative">
                <div className="absolute -left-[21px] top-1 h-3 w-3 rounded-full bg-gray-300 dark:bg-slate-500" />
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {entry.time}
                </p>
                <p className="text-sm font-medium text-slate-900 dark:text-white">
                  {entry.message}
                </p>
              </div>
            ))}
          </div>
        </div>
      </details>
    </div>
  );
}
