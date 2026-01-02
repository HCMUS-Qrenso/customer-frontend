/**
 * Return URL utilities
 * Manages return URL (tenantSlug, tableId, token) for redirecting users
 * back to their original page after authentication
 */

const RETURN_URL_KEY = 'qrenso_return_url';

export interface ReturnUrl {
  tenantSlug: string;
  tableId?: string;
  token?: string;
  path?: string; // e.g., '/menu', '/cart', '/my-order'
}

/**
 * Save return URL to localStorage
 * This persists across tabs and browser sessions
 */
export function saveReturnUrl(returnUrl: ReturnUrl): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(RETURN_URL_KEY, JSON.stringify(returnUrl));
  } catch (error) {
    console.error('Failed to save return URL:', error);
  }
}

/**
 * Get return URL from localStorage
 */
export function getReturnUrl(): ReturnUrl | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const stored = localStorage.getItem(RETURN_URL_KEY);
    if (!stored) return null;
    
    return JSON.parse(stored) as ReturnUrl;
  } catch (error) {
    console.error('Failed to get return URL:', error);
    return null;
  }
}

/**
 * Clear return URL from localStorage
 */
export function clearReturnUrl(): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.removeItem(RETURN_URL_KEY);
  } catch (error) {
    console.error('Failed to clear return URL:', error);
  }
}

/**
 * Build return URL string from ReturnUrl object
 * Format: /{tenantSlug}{path}?table={tableId}&token={token}
 */
export function buildReturnUrlString(returnUrl: ReturnUrl): string {
  const { tenantSlug, tableId, token, path = '/menu' } = returnUrl;
  
  let url = `/${tenantSlug}${path}`;
  const params = new URLSearchParams();
  
  if (tableId) {
    params.set('table', tableId);
  }
  if (token) {
    params.set('token', token);
  }
  
  const queryString = params.toString();
  if (queryString) {
    url += `?${queryString}`;
  }
  
  return url;
}

/**
 * Save current page as return URL
 * Extracts tenantSlug, tableId, token from current URL
 */
export function saveCurrentPageAsReturnUrl(): void {
  if (typeof window === 'undefined') return;
  
  const pathname = window.location.pathname;
  const searchParams = new URLSearchParams(window.location.search);
  
  // Extract tenantSlug from pathname (format: /{tenantSlug}/...)
  const pathParts = pathname.split('/').filter(Boolean);
  if (pathParts.length < 1) return;
  
  const tenantSlug = pathParts[0];
  const path = '/' + pathParts.slice(1).join('/') || '/menu';
  const tableId = searchParams.get('table') || undefined;
  const token = searchParams.get('token') || undefined;
  
  saveReturnUrl({
    tenantSlug,
    tableId,
    token,
    path,
  });
}


