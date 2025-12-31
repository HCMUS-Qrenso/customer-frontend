import axios, { type AxiosInstance, type AxiosError } from "axios";
import { ApiError } from "@/lib/utils/error-handler";
import { getQrToken, getSessionToken } from "@/lib/stores/qr-token-store";

const baseURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

/**
 * Axios client for customer-frontend
 * 
 * Token Priority:
 * 1. Session token (from POST /tables/session/start) - for order operations
 * 2. QR token (from URL scan) - for menu viewing
 * 
 * The session token is preferred because it's issued after the customer
 * explicitly starts a session, while QR token is just from scanning.
 */
const apiClient: AxiosInstance = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000, // 10 seconds timeout
});

// Request interceptor - add Bearer token for API requests
apiClient.interceptors.request.use(
  (config) => {
    // Only add token if Authorization header is not already set
    if (!config.headers.Authorization) {
      // Prioritize session token over QR token
      const sessionToken = getSessionToken();
      const qrToken = getQrToken();
      const token = sessionToken || qrToken;
      
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
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
  (error: AxiosError<{ message?: string; error?: string }>) => {
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
