// Table Context - Type Definitions (from GET /tables/qr/verify-token)

/**
 * Table context returned from QR token verification
 */
export interface TableContextDTO {
  tableId: string;
  tableNumber: string;
  tenantId: string;
  tableCapacity: number;
  tenantName: string;
  tenantImage?: string;
  zoneName?: string;
  session_token?: string; // Session token automatically created when verifying QR token
  session_id?: string; // Session ID
}

/**
 * API response wrapper for verify-token endpoint
 */
export interface VerifyTokenResponse {
  success: boolean;
  data: TableContextDTO;
}
