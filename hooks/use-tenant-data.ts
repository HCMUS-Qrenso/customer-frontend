'use client';

import { useState, useEffect } from 'react';
import type { TenantSettings } from '@/lib/types/table';
import { getTenantSettings, getTenantInfo } from '@/lib/stores/tenant-settings-store';
import { DEFAULT_SETTINGS } from '@/providers/tenant-settings-context';

interface UseTenantDataResult {
  settings: TenantSettings;
  tenantName: string;
  tenantAddress: string | null;
  tenantImage: string | null;
  isLoaded: boolean;
}

/**
 * Hook to load tenant settings from sessionStorage
 * Used to hydrate TenantSettingsProvider on client side
 */
export function useTenantData(): UseTenantDataResult {
  const [settings, setSettings] = useState<TenantSettings>(DEFAULT_SETTINGS);
  const [tenantName, setTenantName] = useState('');
  const [tenantAddress, setTenantAddress] = useState<string | null>(null);
  const [tenantImage, setTenantImage] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Load from sessionStorage on mount
    const storedSettings = getTenantSettings();
    const storedInfo = getTenantInfo();

    if (storedSettings) {
      setSettings(storedSettings);
    }
    
    if (storedInfo) {
      setTenantName(storedInfo.name);
      setTenantAddress(storedInfo.address);
      setTenantImage(storedInfo.image);
    }

    setIsLoaded(true);
  }, []);

  return {
    settings,
    tenantName,
    tenantAddress,
    tenantImage,
    isLoaded,
  };
}
