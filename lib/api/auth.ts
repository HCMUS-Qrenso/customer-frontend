/**
 * Auth API
 * API layer for authentication operations
 */

import { apiClient } from "./client";
import type { AuthUser } from "@/lib/stores/auth-store";

// ============================================
// Request/Response Types
// ============================================

export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface SignupRequest {
  email: string;
  password: string;
  fullName: string;
  phone?: string;
}

export interface AuthResponse {
  accessToken: string;
  user: AuthUser;
}

export interface MessageResponse {
  message: string;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

// ============================================
// API Functions
// ============================================

export const authApi = {
  /**
   * Login with email and password
   * POST /auth/login
   */
  login: async (payload: LoginRequest): Promise<AuthResponse> => {
    const { data } = await apiClient.post<AuthResponse>(
      "/auth/login",
      payload,
      {
        withCredentials: true, // Receive refresh token cookie
      },
    );
    return data;
  },

  /**
   * Register a new customer account
   * POST /auth/signup
   */
  signup: async (payload: SignupRequest): Promise<MessageResponse> => {
    const { data } = await apiClient.post<MessageResponse>(
      "/auth/signup",
      payload,
    );
    return data;
  },

  /**
   * Logout and invalidate refresh token
   * POST /auth/logout
   */
  logout: async (): Promise<MessageResponse> => {
    try {
      const { data } = await apiClient.post<MessageResponse>(
        "/auth/logout",
        {}, // Use empty object instead of null
        {
          withCredentials: true, // Clear refresh token cookie
        },
      );
      return data;
    } catch (error: any) {
      // Handle cases where backend returns empty response or null
      if (error.response?.status === 200 || error.response?.status === 204) {
        return { message: "Logout successful" };
      }
      throw error;
    }
  },

  /**
   * Get current user profile
   * GET /auth/me
   */
  getProfile: async (): Promise<AuthUser> => {
    const { data } = await apiClient.get<AuthUser>("/users/profile");
    return data;
  },

  /**
   * Refresh access token using refresh token from cookie
   * POST /auth/refresh
   */
  refreshToken: async (): Promise<AuthResponse> => {
    const { data } = await apiClient.post<AuthResponse>(
      "/auth/refresh",
      {},
      {
        withCredentials: true, // Important: send cookies
      },
    );
    return data;
  },

  /**
   * Get Google OAuth URL
   * Redirects to Google consent screen
   */
  getGoogleAuthUrl: (): string => {
    const baseURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
    return `${baseURL}/auth/google`;
  },

  /**
   * Forgot password - request password reset email
   * POST /auth/forgot-password
   */
  forgotPassword: async (email: string): Promise<MessageResponse> => {
    const { data } = await apiClient.post<MessageResponse>(
      "/auth/forgot-password",
      { email },
    );
    return data;
  },

  /**
   * Reset password using token from email
   * POST /auth/reset-password
   */
  resetPassword: async (
    token: string,
    newPassword: string,
  ): Promise<MessageResponse> => {
    const { data } = await apiClient.post<MessageResponse>(
      "/auth/reset-password",
      {
        token,
        newPassword,
      },
    );
    return data;
  },

  /**
   * Verify email address using token from email
   * POST /auth/verify-email
   */
  verifyEmail: async (
    email: string,
    token: string,
  ): Promise<MessageResponse> => {
    const { data } = await apiClient.post<MessageResponse>(
      "/auth/verify-email",
      {
        email,
        token,
      },
    );
    return data;
  },

  /**
   * Resend verification or password reset email
   * POST /auth/resend-email
   */
  resendEmail: async (
    email: string,
    type: "email_verification" | "password_reset",
  ): Promise<MessageResponse> => {
    const { data } = await apiClient.post<MessageResponse>(
      "/auth/resend-email",
      {
        email,
        type,
      },
    );
    return data;
  },

  /**
   * Change current user password
   * POST /auth/change-password
   */
  changePassword: async (
    payload: ChangePasswordPayload,
  ): Promise<MessageResponse> => {
    const { data } = await apiClient.post<MessageResponse>(
      "/auth/change-password",
      payload,
    );
    return data;
  },
};
