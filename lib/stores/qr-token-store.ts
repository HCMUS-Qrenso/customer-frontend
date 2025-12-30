/**
 * QR Token Store
 * Manages QR token and Session token for guest users
 * QR token: from URL, used for menu access
 * Session token: from API, used for order operations
 */

let qrToken: string | null = null;
let sessionToken: string | null = null;

// ============================================
// QR Token (from URL)
// ============================================

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

// ============================================
// Session Token (from API, persisted to localStorage)
// ============================================

const SESSION_TOKEN_KEY = 'qrenso_session_token';

/**
 * Store the session token (persisted to localStorage)
 * @param token - The session token from POST /tables/session/start
 */
export function setSessionToken(token: string | null): void {
  sessionToken = token;
  if (typeof window !== 'undefined') {
    if (token) {
      localStorage.setItem(SESSION_TOKEN_KEY, token);
    } else {
      localStorage.removeItem(SESSION_TOKEN_KEY);
    }
  }
}

/**
 * Get the current session token (from memory or localStorage)
 */
export function getSessionToken(): string | null {
  if (!sessionToken && typeof window !== 'undefined') {
    sessionToken = localStorage.getItem(SESSION_TOKEN_KEY);
  }
  return sessionToken;
}

/**
 * Clear the session token
 */
export function clearSessionToken(): void {
  sessionToken = null;
  if (typeof window !== 'undefined') {
    localStorage.removeItem(SESSION_TOKEN_KEY);
  }
}

// ============================================
// Helper Functions
// ============================================

/**
 * Get the appropriate auth token for API requests
 * Prioritize session token (for order operations), fallback to QR token (for menu)
 */
export function getAuthToken(): string | null {
  return getSessionToken() || getQrToken();
}

/**
 * Check if user has an active session
 */
export function hasActiveSession(): boolean {
  return !!getSessionToken();
}

/**
 * Clear all tokens (for logout/session end)
 */
export function clearAllTokens(): void {
  clearQrToken();
  clearSessionToken();
}
