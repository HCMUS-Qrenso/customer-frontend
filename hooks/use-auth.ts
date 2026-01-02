"use client";

import { useEffect, useCallback, useRef } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useAuthStore, type AuthUser } from "@/lib/stores/auth-store";
import { authApi } from "@/lib/api/auth";

/**
 * JWT token expiration time (15 minutes = 900000ms)
 * We refresh 1 minute before expiration
 */
const TOKEN_REFRESH_MARGIN = 60 * 1000; // 1 minute before expiration
const ACCESS_TOKEN_LIFETIME = 15 * 60 * 1000; // 15 minutes

interface UseAuthOptions {
  /** Whether to auto-refresh token before expiration */
  autoRefresh?: boolean;
  /** Whether to redirect to login if not authenticated */
  requireAuth?: boolean;
  /** Custom redirect URL when not authenticated */
  loginUrl?: string;
}

interface UseAuthReturn {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;
  login: (
    email: string,
    password: string,
    rememberMe?: boolean
  ) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
}

/**
 * Hook for authentication with auto-refresh and initialization
 */
export function useAuth(options: UseAuthOptions = {}): UseAuthReturn {
  const {
    autoRefresh = true,
    requireAuth = false,
    loginUrl = "/auth/login",
  } = options;

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const {
    user,
    accessToken,
    isAuthenticated,
    isLoading,
    isInitialized,
    login: loginStore,
    logout: logoutStore,
    setLoading,
    setInitialized,
  } = useAuthStore();

  const refreshTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isRefreshingRef = useRef(false);

  // Build return URL for redirect
  const buildReturnUrl = useCallback(() => {
    const params = searchParams.toString();
    return params ? `${pathname}?${params}` : pathname;
  }, [pathname, searchParams]);

  /**
   * Login with email and password
   */
  const login = useCallback(
    async (email: string, password: string, rememberMe = true) => {
      try {
        setLoading(true);
        const response = await authApi.login({ email, password, rememberMe });
        loginStore(response.user, response.accessToken);
      } catch (error) {
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [loginStore, setLoading]
  );

  /**
   * Logout and clear auth state
   */
  const logout = useCallback(async () => {
    try {
      setLoading(true);
      await authApi.logout();
    } catch (error) {
      // Logout might fail if token already expired, but we still want to clear local state
      console.error("Logout error:", error);
    } finally {
      logoutStore();
    }
  }, [logoutStore, setLoading]);

  /**
   * Refresh access token
   */
  const refreshToken = useCallback(async () => {
    if (isRefreshingRef.current) return;

    try {
      isRefreshingRef.current = true;
      const response = await authApi.refreshToken();
      loginStore(response.user, response.accessToken);
    } catch (error) {
      console.error("Token refresh failed:", error);
      logoutStore();
    } finally {
      isRefreshingRef.current = false;
    }
  }, [loginStore, logoutStore]);

  /**
   * Schedule token refresh before expiration
   */
  const scheduleRefresh = useCallback(() => {
    // Clear existing timeout
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
      refreshTimeoutRef.current = null;
    }

    if (!accessToken || !autoRefresh) return;

    // Schedule refresh 1 minute before expiration
    const refreshDelay = ACCESS_TOKEN_LIFETIME - TOKEN_REFRESH_MARGIN;

    refreshTimeoutRef.current = setTimeout(() => {
      refreshToken();
    }, refreshDelay);
  }, [accessToken, autoRefresh, refreshToken]);

  /**
   * Initialize auth state on mount
   */
  useEffect(() => {
    const initializeAuth = async () => {
      if (isInitialized) return;

      try {
        // If we have an access token, try to refresh it to validate
        if (accessToken) {
          await refreshToken();
        }
      } catch (error) {
        // Token invalid, clear auth state
        logoutStore();
      } finally {
        setInitialized(true);
      }
    };

    initializeAuth();
  }, [accessToken, isInitialized, logoutStore, refreshToken, setInitialized]);

  /**
   * Schedule token refresh when token changes
   */
  useEffect(() => {
    if (isAuthenticated && autoRefresh) {
      scheduleRefresh();
    }

    return () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
    };
  }, [isAuthenticated, autoRefresh, scheduleRefresh]);

  /**
   * Redirect to login if requireAuth and not authenticated
   */
  useEffect(() => {
    if (requireAuth && isInitialized && !isAuthenticated) {
      const returnUrl = buildReturnUrl();
      router.push(`${loginUrl}?returnUrl=${encodeURIComponent(returnUrl)}`);
    }
  }, [
    requireAuth,
    isInitialized,
    isAuthenticated,
    router,
    loginUrl,
    buildReturnUrl,
  ]);

  return {
    user,
    isAuthenticated,
    isLoading,
    isInitialized,
    login,
    logout,
    refreshToken,
  };
}

/**
 * Hook to check if user is authenticated (without redirect)
 */
export function useIsAuthenticated(): boolean {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated;
}

/**
 * Hook to get current user (without redirect)
 */
export function useCurrentUser(): AuthUser | null {
  const { user } = useAuthStore();
  return user;
}
