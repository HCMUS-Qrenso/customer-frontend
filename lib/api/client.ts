import axios, { type AxiosInstance, type AxiosError } from "axios";
import { ApiError } from "@/lib/utils/error-handler";
import { getQrToken, getSessionToken } from "@/lib/stores/qr-token-store";
import { getAccessToken } from "@/lib/stores/auth-store";

const baseURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

/**
 * Axios client for customer-frontend
 *
 * NEW Token Strategy (unified for both guest & authenticated users):
 *
 * Headers:
 * - Authorization: Bearer {accessToken} - ONLY for identity (authenticated users)
 * - x-table-session-token: {sessionToken} - REQUIRED for order operations (both guest & authenticated)
 * - x-qr-token: {qrToken} - For menu viewing and session start (before session exists)
 *
 * This ensures:
 * 1. Identity (who you are) is separate from Session (which table/session)
 * 2. Both guest and authenticated users use same session token for orders
 * 3. Multi-device support: each device gets its own session token
 * 4. Payment lock works consistently across all user types
 */
const apiClient: AxiosInstance = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000, // 10 seconds timeout
  // NOTE: withCredentials removed to prevent cookie conflict with admin frontend
  // Cookies will be sent explicitly only for auth refresh endpoint
});

// Request interceptor - add tokens for API requests
apiClient.interceptors.request.use(
  (config) => {
    const accessToken = getAccessToken();
    const qrToken = getQrToken();
    const sessionToken = getSessionToken();

    // 1. Authorization header: ONLY for identity (authenticated users)
    // This is separate from table session - a user can be logged in without being at a table
    // NEVER use sessionToken or qrToken in Authorization header
    if (accessToken && typeof accessToken === "string") {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    // 2. x-table-session-token: REQUIRED for order operations
    // This is the same for both guest and authenticated users
    // Having a session token means user has started a table session
    // Ensure we only set if token is a valid string (not null or undefined)
    if (sessionToken && typeof sessionToken === "string") {
      config.headers["x-table-session-token"] = sessionToken;
    }

    // 3. x-qr-token: For menu viewing and session start
    // Used before session exists, or as fallback for table context
    // Only send if we don't have a session token (to avoid confusion)
    // Ensure we only set if token is a valid string (not null or undefined)
    if (qrToken && typeof qrToken === "string" && !sessionToken) {
      config.headers["x-qr-token"] = qrToken;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response interceptor - centralized error handling
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<{ message?: string; error?: string; code?: string }>) => {
    const originalRequest = error.config as typeof error.config & {
      _retry?: boolean;
    };

    // Handle 401 Unauthorized
    if (error.response?.status === 401 && !originalRequest?._retry) {
      const errorCode = error.response?.data?.code;

      // Check for session expired/not found errors
      if (
        errorCode === "SESSION_EXPIRED" ||
        errorCode === "SESSION_NOT_FOUND"
      ) {
        // Clear session token from storage
        const { clearSessionToken } = await import("@/lib/stores/qr-token-store");
        clearSessionToken();

        // Redirect to landing page with session_expired flag
        // Only redirect if we're in the browser
        if (typeof window !== "undefined") {
          const pathParts = window.location.pathname.split("/");
          const tenantSlug = pathParts[1]; // /{tenantSlug}/...
          if (tenantSlug) {
            window.location.href = `/${tenantSlug}?session_expired=true`;
            return Promise.reject(error);
          }
        }
      }

      const accessToken = getAccessToken();

      // Only attempt refresh if user was authenticated
      if (accessToken && originalRequest) {
        originalRequest._retry = true;

        try {
          // Import dynamically to avoid circular dependency
          const { authApi } = await import("./auth");
          const { useAuthStore } = await import("@/lib/stores/auth-store");

          // Try to refresh the token
          const response = await authApi.refreshToken();

          // Update store with new token
          useAuthStore.getState().login(response.user, response.accessToken);

          // Retry the original request with new token
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${response.accessToken}`;
          }

          return apiClient(originalRequest);
        } catch (refreshError) {
          // Refresh failed - clear auth state
          const { useAuthStore } = await import("@/lib/stores/auth-store");
          useAuthStore.getState().logout();

          // Don't redirect here - let the component handle it
        }
      }
    }

    // Transform axios error into our ApiError format
    const apiError = new ApiError(
      error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "An error occurred",
      error.response?.status || 500,
      error.response?.data,
    );

    return Promise.reject(apiError);
  },
);

export { apiClient };
