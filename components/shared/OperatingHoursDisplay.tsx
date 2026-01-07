'use client';

import { Clock, CheckCircle2, XCircle } from 'lucide-react';
import { useTenantSettings } from '@/providers/tenant-settings-context';

interface OperatingHoursDisplayProps {
  showFullSchedule?: boolean;
  className?: string;
}

export function OperatingHoursDisplay({
  showFullSchedule = false,
  className = '',
}: OperatingHoursDisplayProps) {
  const { isOpenNow, getTodayHours, settings } = useTenantSettings();

  const isOpen = isOpenNow();
  const todayHours = getTodayHours();

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
            {todayHours.open} - {todayHours.close}
          </span>
        )}
      </div>

      {/* Full schedule (optional) */}
      {showFullSchedule && settings.operating_hours && (
        <div className="mt-2 space-y-1 text-sm">
          {Object.entries(settings.operating_hours).map(([day, hours]) => {
            const dayLabels: Record<string, string> = {
              monday: 'Thứ 2',
              tuesday: 'Thứ 3',
              wednesday: 'Thứ 4',
              thursday: 'Thứ 5',
              friday: 'Thứ 6',
              saturday: 'Thứ 7',
              sunday: 'CN',
            };
            
            return (
              <div key={day} className="flex justify-between">
                <span className="text-slate-600 dark:text-slate-400">
                  {dayLabels[day] || day}
                </span>
                <span className="text-slate-800 dark:text-slate-200">
                  {hours?.closed ? 'Đóng cửa' : `${hours?.open} - ${hours?.close}`}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
