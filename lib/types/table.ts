// Table Session Landing Page - Type Definitions

// ============================================
// Tenant DTOs
// ============================================

/** Day operating hours */
export interface DayHours {
  open: string;  // "09:00"
  close: string; // "22:00"
  closed?: boolean;
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
  tax: TaxSettings;
  service_charge?: ServiceChargeSettings | null;
  operating_hours?: OperatingHours | null;
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
