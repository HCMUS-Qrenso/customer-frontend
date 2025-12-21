'use client';

import { useLanguage } from '@/lib/i18n/context';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Wrench, AlertCircle, RefreshCw, Clock, QrCode } from 'lucide-react';
import { ReactNode } from 'react';

interface ErrorStateProps {
  onRetry?: () => void;
}

/**
 * Base component for full-screen error states with premium design
 */
function FullScreenError({
  icon,
  iconBgClass,
  iconColorClass,
  title,
  description,
  onRetry,
  retryText = 'Thử lại',
}: {
  icon: ReactNode;
  iconBgClass: string;
  iconColorClass: string;
  title: string;
  description: string;
  onRetry?: () => void;
  retryText?: string;
}) {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-slate-50 dark:bg-slate-900 px-6 text-center transition-colors">
      <div className={`mb-6 flex size-20 items-center justify-center rounded-3xl ${iconBgClass} ${iconColorClass} shadow-sm ring-1`}>
        {icon}
      </div>
      <h1 className="mb-2 font-display text-2xl font-bold text-slate-900 dark:text-white">
        {title}
      </h1>
      <p className="max-w-sm text-slate-500 dark:text-slate-400">
        {description}
      </p>
      {onRetry && (
        <Button
          onClick={onRetry}
          className="mt-8 h-12 min-w-[160px] gap-2 rounded-full bg-slate-900 dark:bg-white px-6 text-sm font-semibold text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 active:scale-[0.98]"
        >
          <RefreshCw className="size-4" />
          {retryText}
        </Button>
      )}
    </div>
  );
}

/**
 * Expired QR token error - full screen
 */
export function ExpiredTokenError({ onRetry }: ErrorStateProps) {
  return (
    <FullScreenError
      icon={<Clock className="size-10" />}
      iconBgClass="bg-amber-50 dark:bg-amber-500/10 ring-amber-100 dark:ring-amber-500/20"
      iconColorClass="text-amber-500"
      title="Mã QR hết hạn"
      description="Mã QR này đã hết hạn hoặc không còn hợp lệ. Vui lòng quét lại mã QR tại bàn."
      onRetry={onRetry}
    />
  );
}

/**
 * Invalid QR token error - full screen
 */
export function InvalidTokenError({ onRetry }: ErrorStateProps) {
  return (
    <FullScreenError
      icon={<AlertTriangle className="size-10" />}
      iconBgClass="bg-red-50 dark:bg-red-500/10 ring-red-100 dark:ring-red-500/20"
      iconColorClass="text-red-500"
      title="Mã QR không hợp lệ"
      description="Mã QR bạn quét không đúng định dạng. Vui lòng quét lại mã QR tại bàn."
      onRetry={onRetry}
    />
  );
}

/**
 * Missing QR token error - full screen
 */
export function MissingTokenError({ onRetry }: ErrorStateProps) {
  return (
    <FullScreenError
      icon={<QrCode className="size-10" />}
      iconBgClass="bg-amber-50 dark:bg-amber-500/10 ring-amber-100 dark:ring-amber-500/20"
      iconColorClass="text-amber-500"
      title="Không tìm thấy mã QR"
      description="Vui lòng quét mã QR tại bàn để truy cập menu."
      onRetry={onRetry}
    />
  );
}

/**
 * Invalid QR error - inline version with translation support
 */
export function InvalidQRError({ onRetry }: ErrorStateProps) {
  const { t } = useLanguage();

  return (
    <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
      <div className="mb-6 flex size-20 items-center justify-center rounded-3xl bg-red-50 dark:bg-red-500/10 text-red-500 shadow-sm ring-1 ring-red-100 dark:ring-red-500/20">
        <AlertTriangle className="size-10" />
      </div>
      <h2 className="mb-2 text-xl font-bold text-slate-900 dark:text-white">
        {t.errors.invalidQr.title}
      </h2>
      <p className="mb-8 max-w-xs text-sm text-slate-500 dark:text-slate-400">
        {t.errors.invalidQr.description}
      </p>
      {onRetry && (
        <Button
          onClick={onRetry}
          className="h-12 min-w-[160px] gap-2 rounded-full bg-slate-900 dark:bg-white px-6 text-sm font-semibold text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 active:scale-[0.98]"
        >
          <RefreshCw className="size-4" />
          {t.errors.invalidQr.retry}
        </Button>
      )}
    </div>
  );
}

/**
 * Table inactive error - inline version
 */
export function TableInactiveError() {
  const { t } = useLanguage();

  return (
    <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
      <div className="mb-6 flex size-20 items-center justify-center rounded-3xl bg-amber-50 dark:bg-amber-500/10 text-amber-500 shadow-sm ring-1 ring-amber-100 dark:ring-amber-500/20">
        <Wrench className="size-10" />
      </div>
      <h2 className="mb-2 text-xl font-bold text-slate-900 dark:text-white">
        {t.errors.tableInactive.title}
      </h2>
      <p className="max-w-xs text-sm text-slate-500 dark:text-slate-400">
        {t.errors.tableInactive.description}
      </p>
    </div>
  );
}

/**
 * Network error - compact inline version
 */
export function NetworkError({ onRetry }: ErrorStateProps) {
  const { t } = useLanguage();

  return (
    <div className="rounded-xl bg-red-50 dark:bg-red-500/10 p-4">
      <div className="flex items-start gap-3">
        <AlertCircle className="size-5 shrink-0 text-red-500" />
        <div className="flex-1">
          <p className="text-sm font-semibold text-red-800 dark:text-red-400">{t.errors.network.title}</p>
          <p className="mt-1 text-xs text-red-600 dark:text-red-300">{t.errors.network.description}</p>
          {onRetry && (
            <Button
              variant="ghost"
              onClick={onRetry}
              className="mt-3 h-auto gap-1.5 p-0 text-sm font-semibold text-red-700 dark:text-red-400 hover:bg-transparent hover:text-red-800 dark:hover:text-red-300"
            >
              <RefreshCw className="size-4" />
              {t.errors.network.retry}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
