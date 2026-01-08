// Table Session Landing Page - Type Definitions

// ============================================
// Tenant DTOs
// ============================================

/** Time slot for operating hours */
export interface TimeSlot {
  open: string;  // "09:00"
  close: string; // "22:00"
}

/** Day operating hours - supports multiple time slots */
export interface DayHours {
  slots?: TimeSlot[];  // Multiple time slots (e.g., morning + evening)
  isOpen?: boolean;     // Whether the day is open
  // Legacy format support
  open?: string;       // "09:00" (legacy)
  close?: string;      // "22:00" (legacy)
  closed?: boolean;    // Legacy closed flag
}

/** Operating hours for each day of the week */
export interface OperatingHours {
  monday?: DayHours;
  tuesday?: DayHours;
  wednesday?: DayHours;
  thursday?: DayHours;
  friday?: DayHours;
  saturday?: DayHours;
  sunday?: DayHours;
}

/** Tax settings for tenant */
export interface TaxSettings {
  rate: number;
  inclusive: boolean;
  label: string;
}

/** Service charge settings */
export interface ServiceChargeSettings {
  enabled: boolean;
  rate: number;
  min_party?: number | null;
}

/** Order settings */
export interface OrderSettings {
  min_value?: number | null;
  estimated_prep_time: number;
  allow_special_instructions: boolean;
  session_timeout_minutes: number;
  require_guest_count: boolean;
}

/** Tenant display/branding settings */
export interface TenantBrandingSettings {
  logoUrl?: string;
  coverImageUrl?: string;
  primaryColor?: string;
}

/** Full tenant settings from API */
export interface TenantSettings {
  currency: string;
  currency_symbol: string;
  timezone: string;
  phone?: string | null;
  contact_email?: string | null;
  tax: TaxSettings;
  service_charge?: ServiceChargeSettings | null;
  operating_hours?: OperatingHours | null;
  order?: OrderSettings | null;
}

export interface TenantDTO {
  id?: string;
  name: string;
  slug: string;
  address?: string | null;
  image?: string | null;
  settings?: TenantSettings;
}

// ============================================
// Table DTOs
// ============================================

export type TableStatus = "available" | "occupied" | "reserved" | "maintenance";

export interface TableDTO {
  id: string;
  tableNumber: string;
  capacity: number;
  status: TableStatus;
  isActive: boolean;
  zoneName?: string;
}

// ============================================
// Table Session DTOs
// ============================================

export interface ActiveSessionDTO {
  sessionToken: string;
}

export interface TableContextDTO {
  tenant: TenantDTO;
  table: TableDTO;
  activeSession?: ActiveSessionDTO;
}

// ============================================
// API Request/Response Types
// ============================================

export interface StartSessionRequest {
  tenantSlug: string;
  tableCode: string;
  preferredLanguage: "vi" | "en";
  partySize?: number;
}

export interface StartSessionResponseData {
  session_id: string;
  session_token: string;
  is_join: boolean;
  table: {
    id: string;
    number: string;
    capacity: number;
    zone: string | null;
  };
  tenant: {
    slug: string;
    name: string;
    address?: string | null;
    image?: string | null;
    settings?: TenantSettings;
  };
  started_at: string;
  guest_name?: string;
  guest_count: number;
  expires_at?: string;
  has_active_order: boolean;
}

export interface StartSessionResponse {
  success: boolean;
  message: string;
  data: StartSessionResponseData;
}

// ============================================
// Error Types
// ============================================

export type TableLandingError =
  | "not_found"
  | "table_inactive"
  | "network_error";

// ============================================
// Token Verification Types
// ============================================

export interface VerifyTokenResponse {
  valid: boolean;
  table?: {
    id: string;
    tableNumber: string;
    capacity: number;
    status: string;
    zoneId?: string;
  };
  error?: string;
  message?: string;
}
