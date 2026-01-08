/**
 * Profile API for customer-frontend
 * API layer for user profile operations
 */

import { apiClient } from "@/lib/api/client";
import type { AuthUser } from "@/lib/stores/auth-store";

// ============================================
// Types
// ============================================

export interface UpdateProfilePayload {
  fullName?: string;
  phone?: string | null;
  avatarUrl?: string | null;
}

export interface UpdateProfileResponse {
  message: string;
  user: AuthUser;
}

// ============================================
// API Functions
// ============================================

export const profileApi = {
  /**
   * Update current user profile
   * PUT /users/profile
   */
  updateProfile: async (
    data: UpdateProfilePayload,
  ): Promise<UpdateProfileResponse> => {
    const response = await apiClient.put<UpdateProfileResponse>(
      "/users/profile",
      data,
    );
    return response.data;
  },
};
