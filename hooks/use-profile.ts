/**
 * Profile hooks for customer-frontend
 * React Query hooks for user profile management
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { profileApi } from "@/lib/customer/profile";
import { authApi } from "@/lib/api/auth";
import { useAuthStore } from "@/lib/stores/auth-store";
import type {
  UpdateProfilePayload,
  UpdateProfileResponse,
} from "@/lib/customer/profile";
import type { ChangePasswordPayload, MessageResponse } from "@/lib/api/auth";

// ============================================
// Query Keys
// ============================================

export const profileQueryKeys = {
  all: ["profile"] as const,
  detail: () => [...profileQueryKeys.all, "detail"] as const,
};

// ============================================
// Queries
// ============================================

/**
 * Hook to get user profile from API
 * Fetches current user profile data using React Query
 */
export function useProfileQuery() {
  const { isAuthenticated } = useAuthStore();

  return useQuery({
    queryKey: profileQueryKeys.detail(),
    queryFn: () => authApi.getProfile(),
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });
}

// ============================================
// Mutations
// ============================================

export function useUpdateProfileMutation() {
  const queryClient = useQueryClient();
  const { setUser, user: currentUser } = useAuthStore();

  return useMutation<UpdateProfileResponse, Error, UpdateProfilePayload>({
    mutationFn: profileApi.updateProfile,
    onSuccess: (response, variables) => {
      console.log("Profile update success - Full response:", response);
      console.log("Profile update success - User data:", response.user);

      // Update auth store with new user data from response
      if (response.user) {
        setUser(response.user);
        console.log("Updated auth store with user:", response.user);
      } else if (currentUser) {
        // Fallback: Backend didn't return user data, update locally with payload
        setUser({ ...currentUser, ...variables });
        console.log("Updated user locally with payload:", {
          ...currentUser,
          ...variables,
        });
      }

      // Invalidate profile queries to refresh data
      queryClient.invalidateQueries({ queryKey: profileQueryKeys.all });
    },
    onError: (error) => {
      console.error("Profile update error:", error);
    },
  });
}

export function useChangePasswordMutation() {
  return useMutation<MessageResponse, Error, ChangePasswordPayload>({
    mutationFn: authApi.changePassword,
    onSuccess: (response) => {
      console.log("Password change success:", response);
    },
    onError: (error) => {
      console.error("Password change error:", error);
    },
  });
}
