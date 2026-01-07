'use client';

import { ReactNode } from 'react';
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
  const { settings, tenantName, tenantAddress, tenantImage } = useTenantData();

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
