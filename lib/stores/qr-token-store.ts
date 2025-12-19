/**
 * QR Token Store
 * Manages QR token for guest users
 * The token is extracted from URL and stored for API requests
 */

let qrToken: string | null = null;

/**
 * Store the QR token from URL
 * @param token - The JWT token from QR code scan
 */
export function setQrToken(token: string | null): void {
  qrToken = token;
}

/**
 * Get the current QR token
 * @returns The stored QR token or null
 */
export function getQrToken(): string | null {
  return qrToken;
}

/**
 * Clear the QR token
 */
export function clearQrToken(): void {
  qrToken = null;
}
