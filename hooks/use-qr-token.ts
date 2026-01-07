"use client";

import { useEffect, useRef } from "react";
import {
  setQrToken,
  setTableId,
  getQrToken,
  getTableId,
  clearSessionToken,
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

  useEffect(() => {
    // Always restore tokens from storage on mount (even if URL params are missing)
    // This ensures tokens persist across page reloads and navigation
    // IMPORTANT: This must run on EVERY mount, not just first time
    // This fixes the issue where session token is lost when navigating back to menu

    // CRITICAL: Check if token/tableId actually come from URL params (not from storage fallback)
    // We need to distinguish between URL params and storage values to avoid false comparisons
    // When back to menu, props may be undefined, but MenuClient falls back to storage values
    // We should only process URL params if they are actually from URL, not from storage fallback
    // Check URL directly to determine if params are from URL
    let hasUrlParams = false;
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      hasUrlParams =
        url.searchParams.has("token") && url.searchParams.has("table");
    }

    const storedQrToken = getQrToken();
    const storedTableId = getTableId();

    // If we have stored tokens but no URL params, restore them to memory and return early
    // This handles the case when user reloads page or navigates back without token in URL
    // DO NOT clear session token in this case
    if (storedQrToken && storedTableId) {
      if (!hasUrlParams) {
        // No URL params - restore from storage and return early
        // DO NOT clear session token in this case
        setQrToken(storedQrToken);
        setTableId(storedTableId);
        console.log(
          "[useQrToken] Restored tokens from storage on mount (no URL params) - session token preserved",
        );

        // Mark as initialized and return early to prevent any comparison logic
        if (!hasInitialized.current) {
          hasInitialized.current = true;
        }
        return;
      } else {
        // URL params exist - check if they match stored values
        // If they match, ensure memory is synced
        if (storedQrToken === token && storedTableId === tableId) {
          setQrToken(storedQrToken);
          setTableId(storedTableId);
          console.log(
            "[useQrToken] URL params match stored values - session token preserved",
          );
        }
      }
    }

    // Mark as initialized after first run
    if (!hasInitialized.current) {
      hasInitialized.current = true;
    }

    // Only process URL params if they are actually from URL (not from storage fallback)
    // This prevents clearing session token when navigating back without URL params
    if (!hasUrlParams) {
      console.log(
        "[useQrToken] No URL params provided - skipping comparison logic to preserve session token",
      );
      return;
    }

    // Get current stored values (always read from storage, not memory cache)
    const currentQrToken = getQrToken();
    const currentTableId = getTableId();

    // Check if this is a different QR/table than what's stored
    // Only clear session if we have BOTH stored values AND they are different
    // This ensures we don't clear session when just restoring from storage
    const isDifferentToken = currentQrToken && currentQrToken !== token;
    const isDifferentTable = currentTableId && currentTableId !== tableId;

    // If scanning a new QR code or different table, clear old session
    // BUT: Only clear if we have stored values to compare against
    // This prevents clearing session when navigating back without URL params
    if (
      (isDifferentToken || isDifferentTable) &&
      currentQrToken &&
      currentTableId
    ) {
      console.log("[useQrToken] New QR detected, clearing old session");
      console.log("[useQrToken] Old:", {
        token: currentQrToken?.slice(0, 20),
        tableId: currentTableId,
      });
      console.log("[useQrToken] New:", { token: token?.slice(0, 20), tableId });

      // Clear the session token from the old table
      // This forces the user to start a new session for the new table
      clearSessionToken();
    }

    // Store the new values from URL params
    setQrToken(token || null);
    setTableId(tableId || null);

    // SECURITY: Remove token from URL immediately after storing
    // This prevents token leakage via browser history, referer headers, etc.
    // Always check and remove token from URL when token/tableId changes
    if (typeof window !== "undefined") {
      // Use setTimeout to ensure this runs after the component renders
      // and token is securely stored
      setTimeout(() => {
        const url = new URL(window.location.href);
        const hasToken = url.searchParams.has("token");

        if (hasToken) {
          // Remove token from URL, keep other params like table
          url.searchParams.delete("token");

          // Use replaceState to update URL without adding to history
          window.history.replaceState(
            window.history.state,
            "",
            url.pathname + url.search,
          );

          console.log("[useQrToken] Removed token from URL for security");
        }
      }, 0);
    }
  }, [token, tableId]);
}
