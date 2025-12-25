/**
 * JWT Token Decoder for QR tokens
 * Decodes the JWT payload without verification (verification is done server-side)
 */

export interface QrTokenPayload {
  sub: string; // e.g., "guest_table_66c27faa-00de-41cf-bd9b-b98732eb3308"
  role: "guest";
  tenantId: string;
  tableId: string;
  tableNumber: string;
  tableCapacity: number;
  tenantName: string;
  tenantImage?: string;
  zoneName?: string;
  iat: number;
}

/**
 * Decode a JWT token to extract the payload
 * Note: This does NOT verify the token, just extracts the payload
 * The server will verify the token when making API calls
 *
 * @param token - JWT token string
 * @returns Decoded payload or null if invalid
 */
export function decodeQrToken(token: string): QrTokenPayload | null {
  try {
    // Split the token into parts
    const parts = token.split(".");
    if (parts.length !== 3) {
      return null;
    }

    // Decode the payload (second part)
    const payload = parts[1];
    // Handle base64url encoding
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join(""),
    );

    const decoded = JSON.parse(jsonPayload) as QrTokenPayload;

    // Validate required fields
    if (
      !decoded.tableId ||
      !decoded.tableNumber ||
      !decoded.tenantId ||
      decoded.role !== "guest"
    ) {
      return null;
    }

    return decoded;
  } catch {
    return null;
  }
}
