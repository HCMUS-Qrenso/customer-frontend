'use client';

import { createContext, useContext, useMemo, type ReactNode } from 'react';
import type { TenantSettings, TaxSettings, ServiceChargeSettings, OperatingHours } from '@/lib/types/table';

// ============================================
// Default Settings
// ============================================

const DEFAULT_TAX: TaxSettings = {
  rate: 10,
  inclusive: true,
  label: 'VAT',
};

const DEFAULT_SETTINGS: TenantSettings = {
  currency: 'VND',
  currency_symbol: '₫',
  timezone: 'Asia/Ho_Chi_Minh',
  tax: DEFAULT_TAX,
  service_charge: null,
  operating_hours: null,
};

// ============================================
// Calculation Result Types
// ============================================

interface TotalCalculation {
  subtotal: number;
  tax: number;
  taxLabel: string;
  taxRate: number;
  taxInclusive: boolean;
  serviceCharge: number;
  serviceChargeRate: number;
  total: number;
}

// ============================================
// Context Types
// ============================================

interface TenantSettingsContextValue {
  settings: TenantSettings;
  tenantName: string;
  tenantAddress: string | null;
  tenantImage: string | null;
  
  // Price formatting
  formatPrice: (amount: number) => string;
  
  // Operating hours
  isOpenNow: () => boolean;
  getTodayHours: () => { open: string; close: string } | null;
  
  // Tax & Service Charge Calculations
  calculateServiceCharge: (subtotal: number, guestCount?: number) => number;
  calculateTax: (subtotal: number) => number;
  calculateTotal: (subtotal: number, guestCount?: number) => TotalCalculation;
  getServiceChargeRate: () => number;
  getTaxLabel: () => string;
  getTaxRate: () => number;
  isServiceChargeEnabled: () => boolean;
}

const TenantSettingsContext = createContext<TenantSettingsContextValue | null>(null);

// ============================================
// Provider
// ============================================

interface TenantSettingsProviderProps {
  children: ReactNode;
  settings?: TenantSettings | null;
  tenantName?: string;
  tenantAddress?: string | null;
  tenantImage?: string | null;
}

export function TenantSettingsProvider({
  children,
  settings,
  tenantName = '',
  tenantAddress = null,
  tenantImage = null,
}: TenantSettingsProviderProps) {
  const effectiveSettings = settings || DEFAULT_SETTINGS;

  // Format price helper
  const formatPrice = useMemo(() => {
    return (amount: number): string => {
      const symbol = effectiveSettings.currency_symbol;
      const formatted = amount.toLocaleString('vi-VN', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      });
      return `${formatted} ${symbol}`;
    };
  }, [effectiveSettings.currency_symbol]);

  // Check if restaurant is open now
  const isOpenNow = useMemo(() => {
    return (): boolean => {
      const hours = effectiveSettings.operating_hours;
      if (!hours) return true; // If no hours configured, assume always open

      const now = new Date();
      const dayNames: (keyof OperatingHours)[] = [
        'sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'
      ];
      const today = dayNames[now.getDay()];
      const todayHours = hours[today];

      if (!todayHours || todayHours.closed) return false;

      const currentTime = now.getHours() * 60 + now.getMinutes();
      const [openHour, openMin] = todayHours.open.split(':').map(Number);
      const [closeHour, closeMin] = todayHours.close.split(':').map(Number);
      const openTime = openHour * 60 + openMin;
      const closeTime = closeHour * 60 + closeMin;

      return currentTime >= openTime && currentTime < closeTime;
    };
  }, [effectiveSettings.operating_hours]);

  // Get today's hours
  const getTodayHours = useMemo(() => {
    return (): { open: string; close: string } | null => {
      const hours = effectiveSettings.operating_hours;
      if (!hours) return null;

      const now = new Date();
      const dayNames: (keyof OperatingHours)[] = [
        'sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'
      ];
      const today = dayNames[now.getDay()];
      const todayHours = hours[today];

      if (!todayHours || todayHours.closed) return null;
      return { open: todayHours.open, close: todayHours.close };
    };
  }, [effectiveSettings.operating_hours]);

  // ============================================
  // Tax & Service Charge Calculations
  // ============================================

  // Get service charge rate (0 if disabled)
  const getServiceChargeRate = useMemo(() => {
    return (): number => {
      const sc = effectiveSettings.service_charge;
      if (!sc || !sc.enabled) return 0;
      return sc.rate;
    };
  }, [effectiveSettings.service_charge]);

  // Check if service charge is enabled
  const isServiceChargeEnabled = useMemo(() => {
    return (): boolean => {
      const sc = effectiveSettings.service_charge;
      return !!(sc && sc.enabled);
    };
  }, [effectiveSettings.service_charge]);

  // Get tax label
  const getTaxLabel = useMemo(() => {
    return (): string => {
      return effectiveSettings.tax?.label || 'VAT';
    };
  }, [effectiveSettings.tax]);

  // Get tax rate
  const getTaxRate = useMemo(() => {
    return (): number => {
      return effectiveSettings.tax?.rate || 0;
    };
  }, [effectiveSettings.tax]);

  // Calculate service charge
  // Returns 0 if disabled or below min_party threshold
  const calculateServiceCharge = useMemo(() => {
    return (subtotal: number, guestCount?: number): number => {
      const sc = effectiveSettings.service_charge;
      if (!sc || !sc.enabled) return 0;
      
      // Check min_party threshold if applicable
      if (sc.min_party && guestCount !== undefined && guestCount < sc.min_party) {
        return 0;
      }
      
      return Math.round(subtotal * (sc.rate / 100));
    };
  }, [effectiveSettings.service_charge]);

  // Calculate tax amount
  // If tax is inclusive, this returns 0 (tax already in prices)
  // If tax is exclusive, this returns the tax amount to add
  const calculateTax = useMemo(() => {
    return (subtotal: number): number => {
      const tax = effectiveSettings.tax;
      if (!tax || tax.rate === 0) return 0;
      
      // If tax is inclusive, prices already include tax - return 0 additional
      if (tax.inclusive) return 0;
      
      // If tax is exclusive, calculate tax to add
      return Math.round(subtotal * (tax.rate / 100));
    };
  }, [effectiveSettings.tax]);

  // Calculate total with full breakdown
  const calculateTotal = useMemo(() => {
    return (subtotal: number, guestCount?: number): TotalCalculation => {
      const tax = effectiveSettings.tax || DEFAULT_TAX;
      const serviceCharge = calculateServiceCharge(subtotal, guestCount);
      const taxAmount = calculateTax(subtotal);
      
      // Total = subtotal + service charge + tax (if exclusive)
      const total = subtotal + serviceCharge + taxAmount;
      
      return {
        subtotal,
        tax: taxAmount,
        taxLabel: tax.label,
        taxRate: tax.rate,
        taxInclusive: tax.inclusive,
        serviceCharge,
        serviceChargeRate: getServiceChargeRate(),
        total,
      };
    };
  }, [effectiveSettings.tax, calculateServiceCharge, calculateTax, getServiceChargeRate]);

  const value: TenantSettingsContextValue = {
    settings: effectiveSettings,
    tenantName,
    tenantAddress,
    tenantImage,
    formatPrice,
    isOpenNow,
    getTodayHours,
    // Tax & Service Charge
    calculateServiceCharge,
    calculateTax,
    calculateTotal,
    getServiceChargeRate,
    getTaxLabel,
    getTaxRate,
    isServiceChargeEnabled,
  };

  return (
    <TenantSettingsContext.Provider value={value}>
      {children}
    </TenantSettingsContext.Provider>
  );
}

// ============================================
// Hook
// ============================================

export function useTenantSettings(): TenantSettingsContextValue {
  const context = useContext(TenantSettingsContext);
  if (!context) {
    throw new Error('useTenantSettings must be used within TenantSettingsProvider');
  }
  return context;
}

// Export default settings for fallback
export { DEFAULT_SETTINGS };

