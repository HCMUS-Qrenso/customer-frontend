"use client";

import { Clock, CheckCircle2, XCircle } from "lucide-react";
import { useTenantSettings } from "@/providers/tenant-settings-context";
import type { OperatingHours, DayHours } from "@/lib/types/table";

interface OperatingHoursDisplayProps {
  showFullSchedule?: boolean;
  className?: string;
}

// Day order and localized labels
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
        .filter((slot) => slot.open && slot.close)
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

export function OperatingHoursDisplay({
  showFullSchedule = false,
  className = "",
}: OperatingHoursDisplayProps) {
  const { isOpenNow, getTodayHours, settings } = useTenantSettings();

  const isOpen = isOpenNow();
  const todayHours = getTodayHours();
  const currentDayIndex = getCurrentDayIndex();

  if (!settings.operating_hours) {
    return null; // No operating hours configured
  }

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {/* Open/Closed Badge */}
      <div className="flex items-center gap-2">
        {isOpen ? (
          <>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            <span className="text-sm font-medium text-green-600 dark:text-green-400">
              Đang mở cửa
            </span>
          </>
        ) : (
          <>
            <XCircle className="h-4 w-4 text-red-500" />
            <span className="text-sm font-medium text-red-600 dark:text-red-400">
              Đã đóng cửa
            </span>
          </>
        )}

        {/* Today's hours */}
        {todayHours && (
          <span className="text-sm text-slate-500 dark:text-slate-400">
            <Clock className="inline-block h-3.5 w-3.5 mr-1" />
            {todayHours}
          </span>
        )}
      </div>

      {/* Full schedule (optional) */}
      {showFullSchedule && settings.operating_hours && (
        <div className="mt-2 space-y-1 text-sm">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">
            Lịch mở cửa
          </p>
          {DAYS_ORDER.map(({ key, label }, index) => {
            const dayData = settings.operating_hours?.[key];
            const isToday = index === currentDayIndex;
            const hoursText = formatDayHours(dayData);
            const dayIsOpen = isDayOpen(dayData);

            return (
              <div
                key={key}
                className={`flex justify-between py-1 px-2 rounded ${
                  isToday
                    ? "bg-emerald-50 dark:bg-emerald-500/10 font-medium"
                    : ""
                }`}
              >
                <span
                  className={
                    isToday
                      ? "text-emerald-700 dark:text-emerald-400"
                      : "text-slate-600 dark:text-slate-400"
                  }
                >
                  {label}
                </span>
                <span
                  className={`text-right ${
                    isToday
                      ? "text-emerald-700 dark:text-emerald-400"
                      : !dayIsOpen
                        ? "text-red-500 dark:text-red-400"
                        : "text-slate-800 dark:text-slate-200"
                  }`}
                >
                  {hoursText}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
