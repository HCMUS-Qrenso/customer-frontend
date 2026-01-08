'use client';

import { ReactNode, useEffect } from 'react';
import { TenantSettingsProvider } from './tenant-settings-context';
import { useTenantData } from '@/hooks/use-tenant-data';

interface TenantSettingsClientProviderProps {
  children: ReactNode;
}

/**
 * Client-side wrapper for TenantSettingsProvider
 * Loads settings from sessionStorage and provides them via context
 */
export function TenantSettingsClientProvider({ children }: TenantSettingsClientProviderProps) {
  const { settings, tenantName, tenantAddress, tenantImage, isLoaded } = useTenantData();

  // Debug logging
  useEffect(() => {
    console.log('[TenantSettingsClientProvider] Settings updated:', {
      currency: settings.currency,
      currency_symbol: settings.currency_symbol,
      isLoaded,
    });
  }, [settings, isLoaded]);

  return (
    <TenantSettingsProvider
      settings={settings}
      tenantName={tenantName}
      tenantAddress={tenantAddress}
      tenantImage={tenantImage}
    >
      {children}
    </TenantSettingsProvider>
  );
}
