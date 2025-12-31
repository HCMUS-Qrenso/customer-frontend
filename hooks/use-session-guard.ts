/**
 * Session Guard Hook
 *
 * Monitors session token validity and handles expiration:
 * 1. Checks if session token is about to expire (within 5 minutes)
 * 2. Attempts to refresh token if session is still active
 * 3. Redirects to landing page if session has ended
 */

import { useEffect, useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import {
  getSessionToken,
  clearSessionToken,
  getQrToken,
} from "@/lib/stores/qr-token-store";
import { tableSessionApi } from "@/lib/api/table-session";

interface SessionGuardOptions {
  /** Called when session is expired/invalid and user needs to re-scan QR */
  onSessionExpired?: () => void;
  /** Called when session is refreshed successfully */
  onSessionRefreshed?: (newToken: string) => void;
  /** Tenant slug for redirect */
  tenantSlug?: string;
  /** Whether to auto-redirect on expiry (default: true) */
  autoRedirect?: boolean;
}

interface SessionGuardReturn {
  /** Whether the session is currently valid */
  isValid: boolean;
  /** Whether we're checking/refreshing the session */
  isChecking: boolean;
  /** Error message if any */
  error: string | null;
  /** Manually check and refresh session */
  checkSession: () => Promise<boolean>;
}

// Check interval: every 2 minutes
const CHECK_INTERVAL = 2 * 60 * 1000;
// Refresh threshold: 5 minutes before expiry
const REFRESH_THRESHOLD = 5 * 60 * 1000;

/**
 * Decode JWT payload without verification (client-side)
 */
function decodeJwtPayload(token: string): any | null {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

export function useSessionGuard(
  options: SessionGuardOptions = {}
): SessionGuardReturn {
  const {
    onSessionExpired,
    onSessionRefreshed,
    tenantSlug,
    autoRedirect = true,
  } = options;

  const router = useRouter();
  const [isValid, setIsValid] = useState(true);
  const [isChecking, setIsChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkSession = useCallback(async (): Promise<boolean> => {
    const sessionToken = getSessionToken();

    if (!sessionToken) {
      setIsValid(false);
      setError("No session token found");
      return false;
    }

    // Decode token to check expiry
    const payload = decodeJwtPayload(sessionToken);
    if (!payload || !payload.exp) {
      setIsValid(false);
      setError("Invalid session token");
      return false;
    }

    const expiresAt = payload.exp * 1000; // Convert to milliseconds
    const now = Date.now();
    const timeUntilExpiry = expiresAt - now;

    // If already expired
    if (timeUntilExpiry <= 0) {
      console.log("[SessionGuard] Token expired");
      setIsValid(false);
      setError("Session expired");
      clearSessionToken();
      onSessionExpired?.();

      if (autoRedirect && tenantSlug) {
        router.push(`/${tenantSlug}`);
      }
      return false;
    }

    // If expiring soon, try to refresh
    if (timeUntilExpiry < REFRESH_THRESHOLD) {
      console.log("[SessionGuard] Token expiring soon, attempting refresh");
      setIsChecking(true);

      try {
        const result = await tableSessionApi.getSession(sessionToken);

        if (result.valid) {
          // Session is still active on server, token refresh not needed for now
          // The backend will extend session on activity
          setIsValid(true);
          setError(null);
          return true;
        } else {
          // Session ended on server
          console.log("[SessionGuard] Session ended on server");
          setIsValid(false);
          setError("Session has ended");
          clearSessionToken();
          onSessionExpired?.();

          if (autoRedirect && tenantSlug) {
            router.push(`/${tenantSlug}`);
          }
          return false;
        }
      } catch (err: any) {
        console.error("[SessionGuard] Failed to validate session:", err);
        // On error, assume session is still valid (don't interrupt user)
        return true;
      } finally {
        setIsChecking(false);
      }
    }

    // Token is valid and not expiring soon
    setIsValid(true);
    setError(null);
    return true;
  }, [autoRedirect, onSessionExpired, onSessionRefreshed, router, tenantSlug]);

  // Check session periodically
  useEffect(() => {
    // Initial check
    checkSession();

    // Set up interval
    const intervalId = setInterval(checkSession, CHECK_INTERVAL);

    return () => clearInterval(intervalId);
  }, [checkSession]);

  // Check session on visibility change (user comes back to tab)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        checkSession();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [checkSession]);

  return {
    isValid,
    isChecking,
    error,
    checkSession,
  };
}
