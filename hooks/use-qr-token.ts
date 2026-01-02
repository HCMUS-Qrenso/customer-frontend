"use client";

import { useEffect, useRef } from "react";
import { 
  setQrToken, 
  setTableId, 
  getQrToken,
  getTableId,
  clearSessionToken 
} from "@/lib/stores/qr-token-store";

/**
 * Hook to store QR token and table ID from URL params
 * Persists to sessionStorage via qr-token-store
 * 
 * SECURITY: Also removes token from URL to prevent leakage via:
 * - Browser history
 * - Referer headers to third-party resources
 * - Server logs
 * 
 * IMPORTANT: When a new QR token is scanned for a different table,
 * this hook will clear the old session token to prevent stale data.
 */
export function useQrToken(token?: string, tableId?: string) {
  const hasInitialized = useRef(false);
  const hasCleanedUrl = useRef(false);

  useEffect(() => {
    if (!token || !tableId) return;

    // Get current stored values
    const currentQrToken = getQrToken();
    const currentTableId = getTableId();

    // Check if this is a different QR/table than what's stored
    const isDifferentToken = currentQrToken && currentQrToken !== token;
    const isDifferentTable = currentTableId && currentTableId !== tableId;

    // If scanning a new QR code or different table, clear old session
    if (isDifferentToken || isDifferentTable) {
      console.log('[useQrToken] New QR detected, clearing old session');
      console.log('[useQrToken] Old:', { token: currentQrToken?.slice(0, 20), tableId: currentTableId });
      console.log('[useQrToken] New:', { token: token?.slice(0, 20), tableId });
      
      // Clear the session token from the old table
      // This forces the user to start a new session for the new table
      clearSessionToken();
    }

    // Store the new values
    setQrToken(token);
    setTableId(tableId);
    
    hasInitialized.current = true;

    // SECURITY: Remove token from URL immediately after storing
    // This prevents token leakage via browser history, referer headers, etc.
    if (!hasCleanedUrl.current && typeof window !== 'undefined') {
      hasCleanedUrl.current = true;
      
      // Use setTimeout to ensure this runs after the component renders
      // and token is securely stored
      setTimeout(() => {
        const url = new URL(window.location.href);
        const hasToken = url.searchParams.has('token');
        
        if (hasToken) {
          // Remove token from URL, keep other params like table
          url.searchParams.delete('token');
          
          // Use replaceState to update URL without adding to history
          window.history.replaceState(
            window.history.state,
            '',
            url.pathname + url.search
          );
          
          console.log('[useQrToken] Removed token from URL for security');
        }
      }, 0);
    }
  }, [token, tableId]);
}
