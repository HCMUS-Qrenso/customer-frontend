'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { TableContextDTO, TableLandingError } from './types';
import { LanguageProvider } from '@/app/lib/i18n/context';
import { LanguageToggle } from '@/app/components/LanguageToggle';
import { TableHeroCard } from '@/app/components/TableHeroCard';
import { GuestCountStepper } from '@/app/components/GuestCountStepper';
import { StartSessionButton } from '@/app/components/StartSessionButton';
import { LoadingSkeleton } from '@/app/components/LoadingSkeleton';
import { InvalidQRError, TableInactiveError, NetworkError } from '@/app/components/ErrorStates';
import { useLanguage } from '@/app/lib/i18n/context';
import { Skeleton } from '@/components/ui/skeleton';
import { MapPin, Receipt } from 'lucide-react';

interface TableLandingClientProps {
  tenantSlug: string;
  tableCode: string;
}

function TableLandingContent({ tenantSlug, tableCode }: TableLandingClientProps) {
  const { t } = useLanguage();
  const router = useRouter();
  const [tableContext, setTableContext] = useState<TableContextDTO | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<TableLandingError | null>(null);

  const fetchTableContext = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/public/table-context?tenantSlug=${encodeURIComponent(tenantSlug)}&tableCode=${encodeURIComponent(tableCode)}`
      );

      if (response.status === 404) {
        setError('not_found');
        return;
      }

      if (!response.ok) {
        setError('network_error');
        return;
      }

      const data: TableContextDTO = await response.json();
      
      // Check if table is inactive
      if (!data.table.isActive) {
        setError('table_inactive');
        setTableContext(data);
        return;
      }

      setTableContext(data);
    } catch {
      setError('network_error');
    } finally {
      setIsLoading(false);
    }
  }, [tenantSlug, tableCode]);

  useEffect(() => {
    fetchTableContext();
  }, [fetchTableContext]);

  const handleRetry = () => {
    fetchTableContext();
  };

  const handleReload = () => {
    router.refresh();
  };

  // Render error states
  if (error === 'not_found') {
    return (
      <div className="flex min-h-[100svh] flex-col bg-slate-50">
        <InvalidQRError onRetry={handleReload} />
      </div>
    );
  }

  if (error === 'table_inactive') {
    return (
      <div className="flex min-h-[100svh] flex-col bg-slate-50">
        {/* Header */}
        <header className="sticky top-0 z-30 flex items-start justify-between bg-slate-50/95 px-6 pb-2 pt-6 backdrop-blur-sm sm:pt-8">
          <div className="flex flex-col gap-0.5">
            <h1 className="text-2xl font-bold leading-tight tracking-tight text-slate-900">
              {tableContext?.tenant.name || 'Restaurant'}
            </h1>
            {tableContext?.tenant.address && (
              <div className="flex items-center gap-1 text-sm font-medium text-slate-500">
                <MapPin className="size-4" />
                <span>{tableContext.tenant.address}</span>
              </div>
            )}
          </div>
          <LanguageToggle />
        </header>
        <TableInactiveError />
      </div>
    );
  }

  if (error === 'network_error') {
    return (
      <div className="flex min-h-[100svh] flex-col bg-slate-50 p-6">
        <NetworkError onRetry={handleRetry} />
      </div>
    );
  }

  return (
    <div className="relative mx-auto flex min-h-[100svh] w-full max-w-[480px] flex-col bg-slate-50 shadow-2xl sm:min-h-screen lg:max-w-2xl">
      {/* Header */}
      <header className="sticky top-0 z-30 flex items-start justify-between bg-slate-50/95 px-6 pb-2 pt-6 backdrop-blur-sm sm:pt-8">
        <div className="flex flex-col gap-0.5">
          {isLoading ? (
            <>
              <Skeleton className="h-7 w-32" />
              <Skeleton className="h-4 w-24" />
            </>
          ) : (
            <>
              <h1 className="text-2xl font-bold leading-tight tracking-tight text-slate-900">
                {tableContext?.tenant.name}
              </h1>
              {tableContext?.tenant.address && (
                <div className="flex items-center gap-1 text-sm font-medium text-slate-500">
                  <MapPin className="size-4" />
                  <span>{tableContext.tenant.address}</span>
                </div>
              )}
            </>
          )}
        </div>
        <LanguageToggle />
      </header>

      {/* Main Content */}
      <main className="flex flex-1 flex-col gap-6 px-6 pb-40 pt-4">
        {isLoading ? (
          <LoadingSkeleton />
        ) : tableContext ? (
          <>
            <TableHeroCard
              tableNumber={tableContext.table.tableNumber}
              capacity={tableContext.table.capacity}
              isActive={tableContext.table.isActive}
              zoneName={tableContext.table.zoneName}
              coverImageUrl={tableContext.tenant.settings?.coverImageUrl}
              settings={tableContext.tenant.settings}
            />

            <GuestCountStepper />
          </>
        ) : null}
      </main>

      {/* Sticky Bottom CTA */}
      <div className="fixed bottom-0 left-1/2 z-40 w-full max-w-[480px] -translate-x-1/2 lg:max-w-2xl">
        {/* Gradient Overlay */}
        <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-slate-50 via-slate-50/95 to-transparent" />
        
        <div className="relative flex flex-col items-center gap-3 px-6 pb-[calc(env(safe-area-inset-bottom,16px)+16px)] pt-4">
          <StartSessionButton 
            tenantSlug={tenantSlug}
            tableCode={tableCode}
            disabled={isLoading || !tableContext?.table.isActive}
          />

          {/* Secondary Link */}
          {tableContext?.activeSession && (
            <a
              href={`/${tenantSlug}/t/${tableCode}/order`}
              className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900"
            >
              <Receipt className="size-4" />
              <span>{t.cta.viewOrder}</span>
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

export function TableLandingClient({ tenantSlug, tableCode }: TableLandingClientProps) {
  return (
    <LanguageProvider>
      <TableLandingContent tenantSlug={tenantSlug} tableCode={tableCode} />
    </LanguageProvider>
  );
}
