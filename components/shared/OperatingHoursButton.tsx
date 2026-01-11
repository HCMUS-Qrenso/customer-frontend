"use client";

import { useState, useRef, useEffect } from "react";
import { Clock, ChevronDown, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTenantSettings } from "@/providers/tenant-settings-context";
import { useLanguage } from "@/lib/i18n/context";
import type { OperatingHours, DayHours } from "@/lib/types/table";

interface OperatingHoursButtonProps {
  className?: string;
}

// Day order and localized labels (Monday first, Sunday last)
const DAYS_ORDER: Array<{ key: keyof OperatingHours; label: string }> = [
  { key: "monday", label: "Thứ 2" },
  { key: "tuesday", label: "Thứ 3" },
  { key: "wednesday", label: "Thứ 4" },
  { key: "thursday", label: "Thứ 5" },
  { key: "friday", label: "Thứ 6" },
  { key: "saturday", label: "Thứ 7" },
  { key: "sunday", label: "Chủ Nhật" },
];

// Get current day index (0 = Monday, 6 = Sunday)
function getCurrentDayIndex(): number {
  const jsDay = new Date().getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  return jsDay === 0 ? 6 : jsDay - 1; // Convert to 0 = Monday, 6 = Sunday
}

// Format day hours - supports both slots-based and legacy format
function formatDayHours(hours: DayHours | undefined): string {
  // No data for this day
  if (!hours) {
    return "Đóng cửa";
  }

  // New format: isOpen + slots
  if (typeof hours.isOpen === "boolean") {
    if (!hours.isOpen) {
      return "Đóng cửa";
    }
    // isOpen is true, check for slots
    if (hours.slots && hours.slots.length > 0) {
      return hours.slots
        .map((slot) => `${slot.open} - ${slot.close}`)
        .join(", ");
    }
    return "Đóng cửa"; // isOpen but no slots
  }

  // Legacy format: closed flag + direct open/close
  if (hours.closed) {
    return "Đóng cửa";
  }
  if (hours.open && hours.close) {
    return `${hours.open} - ${hours.close}`;
  }

  return "Đóng cửa";
}

// Check if day is open
function isDayOpen(hours: DayHours | undefined): boolean {
  if (!hours) return false;

  // New format
  if (typeof hours.isOpen === "boolean") {
    return hours.isOpen && !!hours.slots && hours.slots.length > 0;
  }

  // Legacy format
  return !hours.closed && !!hours.open && !!hours.close;
}

export function OperatingHoursButton({
  className = "",
}: OperatingHoursButtonProps) {
  const { t } = useLanguage();
  const { isOpenNow, getTodayHours, settings } = useTenantSettings();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isCurrentlyOpen = isOpenNow();
  const todayHours = getTodayHours();
  const currentDayIndex = getCurrentDayIndex();

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  // Don't render if no operating hours configured
  if (!settings.operating_hours) {
    return null;
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className={`gap-1.5 px-2.5 h-8 ${className}`}
      >
        {/* Status dot */}
        <span
          className={`size-2 rounded-full ${
            isCurrentlyOpen ? "bg-green-500 animate-pulse" : "bg-red-500"
          }`}
        />
        <Clock className="size-3.5" />
        <span className="text-xs font-medium">
          {isCurrentlyOpen ? (t.misc?.open || "Open") : (t.misc?.closed || "Closed")}
        </span>
        <ChevronDown
          className={`size-3 opacity-50 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </Button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 z-50 w-72 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-xl animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Header */}
          <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span
                className={`size-2.5 rounded-full ${
                  isCurrentlyOpen ? "bg-green-500 animate-pulse" : "bg-red-500"
                }`}
              />
              <span
                className={`font-semibold text-sm ${
                  isCurrentlyOpen
                    ? "text-green-600 dark:text-green-400"
                    : "text-red-600 dark:text-red-400"
                }`}
              >
                {isCurrentlyOpen ? (t.misc?.nowOpen || "Now Open") : (t.misc?.nowClosed || "Now Closed")}
              </span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400"
            >
              <X className="size-4" />
            </button>
          </div>

          {/* Today's hours */}
          {todayHours && (
            <div className="px-4 py-2 bg-emerald-50 dark:bg-emerald-500/10 border-b border-slate-200 dark:border-slate-700">
              <p className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
                Hôm nay: {todayHours}
              </p>
            </div>
          )}

          {/* Schedule - Sorted by DAYS_ORDER */}
          <div className="p-4 space-y-1.5 max-h-64 overflow-y-auto">
            <h4 className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
              Lịch mở cửa
            </h4>
            {DAYS_ORDER.map(({ key, label }, index) => {
              const dayData = settings.operating_hours?.[key];
              const isToday = index === currentDayIndex;
              const hoursText = formatDayHours(dayData);
              const dayIsOpen = isDayOpen(dayData);

              return (
                <div
                  key={key}
                  className={`flex justify-between text-sm py-1.5 px-2 rounded-lg ${
                    isToday ? "bg-emerald-50 dark:bg-emerald-500/10" : ""
                  }`}
                >
                  <span
                    className={`${
                      isToday
                        ? "font-semibold text-emerald-700 dark:text-emerald-300"
                        : "text-slate-600 dark:text-slate-400"
                    }`}
                  >
                    {label}
                  </span>
                  <span
                    className={`tabular-nums text-right ${
                      !dayIsOpen
                        ? "text-red-500 dark:text-red-400"
                        : isToday
                          ? "font-semibold text-emerald-700 dark:text-emerald-300"
                          : "text-slate-800 dark:text-slate-200"
                    }`}
                  >
                    {hoursText}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
