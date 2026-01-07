/**
 * Tenant Settings Store
 * Persists tenant settings from startSession API response for use across the app
 */

import type { TenantSettings } from '@/lib/types/table';

const STORAGE_KEY = 'tenant_settings';
const TENANT_INFO_KEY = 'tenant_info';

interface TenantInfo {
  name: string;
  address: string | null;
  image: string | null;
}

/**
 * Save tenant settings to sessionStorage
 */
export function saveTenantSettings(settings: TenantSettings): void {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error('[TenantSettingsStore] Failed to save settings:', error);
  }
}

/**
 * Get tenant settings from sessionStorage
 */
export function getTenantSettings(): TenantSettings | null {
  if (typeof window === 'undefined') return null;
  try {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.error('[TenantSettingsStore] Failed to get settings:', error);
    return null;
  }
}

/**
 * Save tenant info (name, address, image) to sessionStorage
 */
export function saveTenantInfo(info: TenantInfo): void {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.setItem(TENANT_INFO_KEY, JSON.stringify(info));
  } catch (error) {
    console.error('[TenantSettingsStore] Failed to save tenant info:', error);
  }
}

/**
 * Get tenant info from sessionStorage
 */
export function getTenantInfo(): TenantInfo | null {
  if (typeof window === 'undefined') return null;
  try {
    const stored = sessionStorage.getItem(TENANT_INFO_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.error('[TenantSettingsStore] Failed to get tenant info:', error);
    return null;
  }
}

/**
 * Clear tenant settings and info (call on session end)
 */
export function clearTenantData(): void {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.removeItem(STORAGE_KEY);
    sessionStorage.removeItem(TENANT_INFO_KEY);
  } catch (error) {
    console.error('[TenantSettingsStore] Failed to clear data:', error);
  }
}
