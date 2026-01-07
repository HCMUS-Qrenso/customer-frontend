'use client';

import { useState, useRef, useEffect } from 'react';
import { Clock, ChevronDown, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTenantSettings } from '@/providers/tenant-settings-context';

interface OperatingHoursButtonProps {
  className?: string;
}

export function OperatingHoursButton({ className = '' }: OperatingHoursButtonProps) {
  const { isOpenNow, getTodayHours, settings } = useTenantSettings();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isCurrentlyOpen = isOpenNow();
  const todayHours = getTodayHours();

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // Don't render if no operating hours configured
  if (!settings.operating_hours) {
    return null;
  }

  const dayLabels: Record<string, string> = {
    monday: 'Thứ 2',
    tuesday: 'Thứ 3',
    wednesday: 'Thứ 4',
    thursday: 'Thứ 5',
    friday: 'Thứ 6',
    saturday: 'Thứ 7',
    sunday: 'Chủ nhật',
  };

  // Get current day for highlighting
  const now = new Date();
  const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const currentDayName = dayNames[now.getDay()];

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
            isCurrentlyOpen 
              ? 'bg-green-500 animate-pulse' 
              : 'bg-red-500'
          }`}
        />
        <Clock className="size-3.5" />
        <span className="text-xs font-medium">
          {isCurrentlyOpen ? 'Mở cửa' : 'Đóng cửa'}
        </span>
        <ChevronDown className={`size-3 opacity-50 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </Button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 z-50 w-64 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-xl animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Header */}
          <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span
                className={`size-2.5 rounded-full ${
                  isCurrentlyOpen 
                    ? 'bg-green-500 animate-pulse' 
                    : 'bg-red-500'
                }`}
              />
              <span className={`font-semibold text-sm ${
                isCurrentlyOpen 
                  ? 'text-green-600 dark:text-green-400' 
                  : 'text-red-600 dark:text-red-400'
              }`}>
                {isCurrentlyOpen ? 'Đang mở cửa' : 'Đã đóng cửa'}
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
                Hôm nay: {todayHours.open} - {todayHours.close}
              </p>
            </div>
          )}

          {/* Schedule */}
          <div className="p-4 space-y-1.5 max-h-64 overflow-y-auto">
            <h4 className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
              Lịch mở cửa
            </h4>
            {Object.entries(settings.operating_hours).map(([day, hours]) => {
              const isToday = day === currentDayName;
              return (
                <div 
                  key={day} 
                  className={`flex justify-between text-sm py-1.5 px-2 rounded-lg ${
                    isToday 
                      ? 'bg-emerald-50 dark:bg-emerald-500/10' 
                      : ''
                  }`}
                >
                  <span className={`${
                    isToday 
                      ? 'font-semibold text-emerald-700 dark:text-emerald-300' 
                      : 'text-slate-600 dark:text-slate-400'
                  }`}>
                    {dayLabels[day] || day}
                  </span>
                  <span className={`tabular-nums ${
                    hours?.closed 
                      ? 'text-slate-400 dark:text-slate-500 italic' 
                      : isToday 
                        ? 'font-semibold text-emerald-700 dark:text-emerald-300' 
                        : 'text-slate-800 dark:text-slate-200'
                  }`}>
                    {hours?.closed ? 'Đóng cửa' : `${hours?.open} - ${hours?.close}`}
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
