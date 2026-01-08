'use client';

import { useState, useEffect, useCallback } from 'react';
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
 * Listens for custom 'tenant-settings-updated' event to re-read settings
 */
export function useTenantData(): UseTenantDataResult {
  const [settings, setSettings] = useState<TenantSettings>(DEFAULT_SETTINGS);
  const [tenantName, setTenantName] = useState('');
  const [tenantAddress, setTenantAddress] = useState<string | null>(null);
  const [tenantImage, setTenantImage] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Function to read all data from storage
  const loadFromStorage = useCallback(() => {
    const storedSettings = getTenantSettings();
    const storedInfo = getTenantInfo();

    if (storedSettings) {
      console.log('[useTenantData] Loading settings:', storedSettings);
      setSettings(storedSettings);
    }
    
    if (storedInfo) {
      setTenantName(storedInfo.name);
      setTenantAddress(storedInfo.address);
      setTenantImage(storedInfo.image);
    }
  }, []);

  useEffect(() => {
    // Initial load from storage
    loadFromStorage();
    setIsLoaded(true);

    // Listen for settings updates (same-tab)
    const handleUpdate = () => {
      console.log('[useTenantData] Received tenant-settings-updated event');
      loadFromStorage();
    };

    // Listen for storage events (cross-tab)
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'tenant_settings' || e.key === 'tenant_info') {
        loadFromStorage();
      }
    };

    window.addEventListener('tenant-settings-updated', handleUpdate);
    window.addEventListener('storage', handleStorage);

    return () => {
      window.removeEventListener('tenant-settings-updated', handleUpdate);
      window.removeEventListener('storage', handleStorage);
    };
  }, [loadFromStorage]);

  return {
    settings,
    tenantName,
    tenantAddress,
    tenantImage,
    isLoaded,
  };
}
