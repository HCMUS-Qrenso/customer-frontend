/**
 * QR Token Store
 * Manages QR token and Session token for guest users
 * QR token: from URL, used for menu access (persisted to sessionStorage)
 * Session token: from API, used for order operations (persisted to localStorage)
 */

let qrToken: string | null = null;
let tableId: string | null = null;
let sessionToken: string | null = null;

// ============================================
// QR Token (from URL, persisted to sessionStorage)
// ============================================

const QR_TOKEN_KEY = "qrenso_qr_token";
const TABLE_ID_KEY = "qrenso_table_id";

/**
 * Store the QR token from URL (persisted to sessionStorage)
 * @param token - The JWT token from QR code scan
 */
export function setQrToken(token: string | null): void {
  qrToken = token;
  if (typeof window !== "undefined") {
    if (token) {
      sessionStorage.setItem(QR_TOKEN_KEY, token);
    } else {
      sessionStorage.removeItem(QR_TOKEN_KEY);
    }
  }
}

/**
 * Get the current QR token (from memory or sessionStorage)
 * @returns The stored QR token or null
 */
export function getQrToken(): string | null {
  // Always read from sessionStorage to ensure we have latest value
  // This handles cases where sessionStorage is restored (e.g., browser back/forward)
  if (typeof window !== "undefined") {
    const stored = sessionStorage.getItem(QR_TOKEN_KEY);
    qrToken = stored;
    return stored;
  }
  return qrToken;
}

/**
 * Clear the QR token
 */
export function clearQrToken(): void {
  qrToken = null;
  if (typeof window !== "undefined") {
    sessionStorage.removeItem(QR_TOKEN_KEY);
  }
}

// ============================================
// Table ID (from URL, persisted to sessionStorage)
// ============================================

/**
 * Store the table ID from URL (persisted to sessionStorage)
 * @param id - The table ID from URL params
 */
export function setTableId(id: string | null): void {
  tableId = id;
  if (typeof window !== "undefined") {
    if (id) {
      sessionStorage.setItem(TABLE_ID_KEY, id);
    } else {
      sessionStorage.removeItem(TABLE_ID_KEY);
    }
  }
}

/**
 * Get the current table ID (from memory or sessionStorage)
 */
export function getTableId(): string | null {
  // Always read from sessionStorage to ensure we have latest value
  // This handles cases where sessionStorage is restored (e.g., browser back/forward)
  if (typeof window !== "undefined") {
    const stored = sessionStorage.getItem(TABLE_ID_KEY);
    tableId = stored;
    return stored;
  }
  return tableId;
}

/**
 * Clear the table ID
 */
export function clearTableId(): void {
  tableId = null;
  if (typeof window !== "undefined") {
    sessionStorage.removeItem(TABLE_ID_KEY);
  }
}

// ============================================
// Session Token (from API, persisted to localStorage)
// ============================================

const SESSION_TOKEN_KEY = "qrenso_session_token";

/**
 * Store the session token (persisted to localStorage)
 * @param token - The session token from POST /tables/session/start
 */
export function setSessionToken(token: string | null): void {
  sessionToken = token;
  if (typeof window !== "undefined") {
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
  // Always read from localStorage to ensure we have latest value
  // This handles cases where localStorage is restored (e.g., browser back/forward)
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem(SESSION_TOKEN_KEY);
    sessionToken = stored;
    return stored;
  }
  return sessionToken;
}

/**
 * Clear the session token
 */
export function clearSessionToken(): void {
  sessionToken = null;
  if (typeof window !== "undefined") {
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
  clearTableId();
  clearSessionToken();
}
