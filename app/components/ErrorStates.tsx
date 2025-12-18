'use client';

import { useLanguage } from '@/app/lib/i18n/context';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Wrench, AlertCircle, RefreshCw } from 'lucide-react';

interface ErrorStateProps {
  onRetry?: () => void;
}

export function InvalidQRError({ onRetry }: ErrorStateProps) {
  const { t } = useLanguage();

  return (
    <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
      {/* Icon */}
      <div className="mb-6 flex size-20 items-center justify-center rounded-full bg-red-100">
        <AlertTriangle className="size-10 text-red-500" />
      </div>

      {/* Message */}
      <h2 className="mb-2 text-xl font-bold text-slate-900">
        {t.errors.invalidQr.title}
      </h2>
      <p className="mb-8 max-w-xs text-sm text-slate-500">
        {t.errors.invalidQr.description}
      </p>

      {/* Retry Button */}
      {onRetry && (
        <Button
          onClick={onRetry}
          className="h-12 min-w-[160px] gap-2 rounded-full bg-slate-900 px-6 text-sm font-semibold text-white hover:bg-slate-800 active:scale-[0.98]"
        >
          <RefreshCw className="size-4" />
          {t.errors.invalidQr.retry}
        </Button>
      )}
    </div>
  );
}

export function TableInactiveError() {
  const { t } = useLanguage();

  return (
    <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
      {/* Icon */}
      <div className="mb-6 flex size-20 items-center justify-center rounded-full bg-amber-100">
        <Wrench className="size-10 text-amber-500" />
      </div>

      {/* Message */}
      <h2 className="mb-2 text-xl font-bold text-slate-900">
        {t.errors.tableInactive.title}
      </h2>
      <p className="max-w-xs text-sm text-slate-500">
        {t.errors.tableInactive.description}
      </p>
    </div>
  );
}

export function NetworkError({ onRetry }: ErrorStateProps) {
  const { t } = useLanguage();

  return (
    <div className="rounded-xl bg-red-50 p-4">
      <div className="flex items-start gap-3">
        <AlertCircle className="size-5 shrink-0 text-red-500" />
        <div className="flex-1">
          <p className="text-sm font-semibold text-red-800">{t.errors.network.title}</p>
          <p className="mt-1 text-xs text-red-600">{t.errors.network.description}</p>
          {onRetry && (
            <Button
              variant="ghost"
              onClick={onRetry}
              className="mt-3 h-auto gap-1.5 p-0 text-sm font-semibold text-red-700 hover:bg-transparent hover:text-red-800"
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
