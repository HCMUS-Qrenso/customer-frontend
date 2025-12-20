// Table Session Landing Page - Type Definitions

// ============================================
// Tenant DTOs
// ============================================

export interface TenantSettings {
  logoUrl?: string;
  coverImageUrl?: string;
  primaryColor?: string;
}

export interface TenantDTO {
  id: string;
  name: string;
  slug: string;
  address?: string;
  settings?: TenantSettings;
}

// ============================================
// Table DTOs
// ============================================

export type TableStatus = 'available' | 'occupied' | 'reserved' | 'maintenance';

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
  preferredLanguage: 'vi' | 'en';
  partySize?: number;
}

export interface StartSessionResponse {
  sessionToken: string;
}

// ============================================
// Error Types
// ============================================

export type TableLandingError = 
  | 'not_found'
  | 'table_inactive'
  | 'network_error';

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
