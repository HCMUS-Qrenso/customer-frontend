"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
import type {
  TenantSettings,
  TaxSettings,
  ServiceChargeSettings,
  OperatingHours,
  OrderSettings,
} from "@/lib/types/table";
import {
  formatDateTime as formatDateTimeLib,
  formatShortDate,
  formatTime as formatTimeLib,
  formatRelativeDate as formatRelativeDateLib,
} from "@/lib/format";

// ============================================
// Default Settings
// ============================================

const DEFAULT_TAX: TaxSettings = {
  rate: 10,
  inclusive: true,
  label: "VAT",
};

const DEFAULT_SETTINGS: TenantSettings = {
  currency: "VND",
  currency_symbol: "₫",
  timezone: "Asia/Ho_Chi_Minh",
  tax: DEFAULT_TAX,
  service_charge: null,
  operating_hours: null,
  order: null,
};

const DEFAULT_ORDER_SETTINGS: OrderSettings = {
  min_value: null,
  estimated_prep_time: 15,
  allow_special_instructions: true,
  session_timeout_minutes: 120,
  require_guest_count: false,
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
  getTodayHours: () => string | null;

  // Tax & Service Charge Calculations
  calculateServiceCharge: (subtotal: number, guestCount?: number) => number;
  calculateTax: (subtotal: number) => number;
  calculateTotal: (subtotal: number, guestCount?: number) => TotalCalculation;
  getServiceChargeRate: () => number;
  getTaxLabel: () => string;
  getTaxRate: () => number;
  isServiceChargeEnabled: () => boolean;

  // Date/Time formatting (uses tenant timezone)
  formatDate: (dateString: string) => string;
  formatTime: (dateString: string) => string;
  formatDateTime: (dateString: string) => string;
  formatRelativeDate: (dateString: string) => string;

  // Order Settings
  orderSettings: OrderSettings;
  minOrderValue: number | null;
  allowSpecialInstructions: boolean;
  requireGuestCount: boolean;
  sessionTimeoutMinutes: number;
  isMinOrderMet: (cartTotal: number) => boolean;
  getMinOrderGap: (cartTotal: number) => number;
}

const TenantSettingsContext = createContext<TenantSettingsContextValue | null>(
  null,
);

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
  tenantName = "",
  tenantAddress = null,
  tenantImage = null,
}: TenantSettingsProviderProps) {
  const effectiveSettings = settings || DEFAULT_SETTINGS;

  // Format price helper - dynamic based on currency settings
  const formatPrice = useMemo(() => {
    return (amount: number): string => {
      const symbol = effectiveSettings.currency_symbol;
      const currency = effectiveSettings.currency;

      // Determine locale and decimal places based on currency
      const locale = currency === "VND" ? "vi-VN" : "en-US";
      const decimals = currency === "VND" ? 0 : 2;

      const formatted = amount.toLocaleString(locale, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      });

      // Currency symbol position: prefix for $ (USD), suffix for ₫ (VND)
      return currency === "VND"
        ? `${formatted} ${symbol}`
        : `${symbol}${formatted}`;
    };
  }, [effectiveSettings.currency_symbol, effectiveSettings.currency]);

  // Check if restaurant is open now
  const isOpenNow = useMemo(() => {
    return (): boolean => {
      const hours = effectiveSettings.operating_hours;
      if (!hours) return true; // If no hours configured, assume always open

      const now = new Date();
      const dayNames: (keyof OperatingHours)[] = [
        "sunday",
        "monday",
        "tuesday",
        "wednesday",
        "thursday",
        "friday",
        "saturday",
      ];
      const today = dayNames[now.getDay()];
      const todayHours = hours[today];

      if (!todayHours) return false;

      // New format: isOpen + slots
      if (typeof todayHours.isOpen === "boolean") {
        if (
          !todayHours.isOpen ||
          !todayHours.slots ||
          todayHours.slots.length === 0
        ) {
          return false;
        }
        const currentTime = now.getHours() * 60 + now.getMinutes();
        // Check if current time is within any slot
        return todayHours.slots.some((slot) => {
          if (!slot.open || !slot.close) return false;
          const [openHour, openMin] = slot.open.split(":").map(Number);
          const [closeHour, closeMin] = slot.close.split(":").map(Number);
          const openTime = openHour * 60 + openMin;
          const closeTime = closeHour * 60 + closeMin;
          return currentTime >= openTime && currentTime < closeTime;
        });
      }

      // Legacy format: closed + open/close
      if (todayHours.closed || !todayHours.open || !todayHours.close)
        return false;
      const currentTime = now.getHours() * 60 + now.getMinutes();
      const [openHour, openMin] = todayHours.open.split(":").map(Number);
      const [closeHour, closeMin] = todayHours.close.split(":").map(Number);
      const openTime = openHour * 60 + openMin;
      const closeTime = closeHour * 60 + closeMin;
      return currentTime >= openTime && currentTime < closeTime;
    };
  }, [effectiveSettings.operating_hours]);

  // Get today's hours as formatted string
  const getTodayHours = useMemo(() => {
    return (): string | null => {
      const hours = effectiveSettings.operating_hours;
      if (!hours) return null;

      const now = new Date();
      const dayNames: (keyof OperatingHours)[] = [
        "sunday",
        "monday",
        "tuesday",
        "wednesday",
        "thursday",
        "friday",
        "saturday",
      ];
      const today = dayNames[now.getDay()];
      const todayHours = hours[today];

      if (!todayHours) return null;

      // New format: isOpen + slots
      if (typeof todayHours.isOpen === "boolean") {
        if (
          !todayHours.isOpen ||
          !todayHours.slots ||
          todayHours.slots.length === 0
        ) {
          return null;
        }
        return todayHours.slots
          .filter((slot) => slot.open && slot.close)
          .map((slot) => `${slot.open} - ${slot.close}`)
          .join(", ");
      }

      // Legacy format
      if (todayHours.closed || !todayHours.open || !todayHours.close)
        return null;
      return `${todayHours.open} - ${todayHours.close}`;
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
      return effectiveSettings.tax?.label || "VAT";
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
      if (
        sc.min_party &&
        guestCount !== undefined &&
        guestCount < sc.min_party
      ) {
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
  }, [
    effectiveSettings.tax,
    calculateServiceCharge,
    calculateTax,
    getServiceChargeRate,
  ]);

  // Date/Time formatting helpers (use tenant timezone)
  const formatDate = useMemo(() => {
    return (dateString: string): string => {
      return formatShortDate(dateString, {
        timezone: effectiveSettings.timezone,
      });
    };
  }, [effectiveSettings.timezone]);

  const formatTime = useMemo(() => {
    return (dateString: string): string => {
      return formatTimeLib(dateString, {
        timezone: effectiveSettings.timezone,
      });
    };
  }, [effectiveSettings.timezone]);

  const formatDateTime = useMemo(() => {
    return (dateString: string): string => {
      return formatDateTimeLib(dateString, {
        timezone: effectiveSettings.timezone,
      });
    };
  }, [effectiveSettings.timezone]);

  const formatRelativeDate = useMemo(() => {
    return (dateString: string): string => {
      return formatRelativeDateLib(dateString, "vi");
    };
  }, []);

  // Order Settings helpers
  const orderSettings = useMemo(() => {
    return effectiveSettings.order || DEFAULT_ORDER_SETTINGS;
  }, [effectiveSettings.order]);

  const minOrderValue = useMemo(() => {
    return orderSettings.min_value ?? null;
  }, [orderSettings.min_value]);

  const allowSpecialInstructions = useMemo(() => {
    return orderSettings.allow_special_instructions;
  }, [orderSettings.allow_special_instructions]);

  const requireGuestCount = useMemo(() => {
    return orderSettings.require_guest_count;
  }, [orderSettings.require_guest_count]);

  const sessionTimeoutMinutes = useMemo(() => {
    return orderSettings.session_timeout_minutes;
  }, [orderSettings.session_timeout_minutes]);

  const isMinOrderMet = useMemo(() => {
    return (cartTotal: number): boolean => {
      if (minOrderValue === null) return true;
      return cartTotal >= minOrderValue;
    };
  }, [minOrderValue]);

  const getMinOrderGap = useMemo(() => {
    return (cartTotal: number): number => {
      if (minOrderValue === null) return 0;
      return Math.max(0, minOrderValue - cartTotal);
    };
  }, [minOrderValue]);

  const value: TenantSettingsContextValue = useMemo(
    () => ({
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
      // Date/Time formatting
      formatDate,
      formatTime,
      formatDateTime,
      formatRelativeDate,
      // Order Settings
      orderSettings,
      minOrderValue,
      allowSpecialInstructions,
      requireGuestCount,
      sessionTimeoutMinutes,
      isMinOrderMet,
      getMinOrderGap,
    }),
    [
      effectiveSettings,
      tenantName,
      tenantAddress,
      tenantImage,
      formatPrice,
      isOpenNow,
      getTodayHours,
      calculateServiceCharge,
      calculateTax,
      calculateTotal,
      getServiceChargeRate,
      getTaxLabel,
      getTaxRate,
      isServiceChargeEnabled,
      formatDate,
      formatTime,
      formatDateTime,
      formatRelativeDate,
      orderSettings,
      minOrderValue,
      allowSpecialInstructions,
      requireGuestCount,
      sessionTimeoutMinutes,
      isMinOrderMet,
      getMinOrderGap,
    ],
  );

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
    throw new Error(
      "useTenantSettings must be used within TenantSettingsProvider",
    );
  }
  return context;
}

// Export default settings for fallback
export { DEFAULT_SETTINGS };
