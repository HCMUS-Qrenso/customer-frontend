import { useMutation, useQueryClient } from "@tanstack/react-query";
import { tableSessionApi } from "@/lib/api/table-session";
import { tableContextQueryKeys } from "./use-table-context-query";
import { saveTenantSettings, saveTenantInfo } from "@/lib/stores/tenant-settings-store";
import type {
  StartSessionRequest,
  StartSessionResponse,
} from "@/lib/types/table";

/**
 * Hook to start a new table session
 * Called when customer clicks "Start Ordering" button
 */
export function useStartSessionMutation() {
  const queryClient = useQueryClient();

  return useMutation<StartSessionResponse, Error, StartSessionRequest>({
    mutationFn: (payload) => tableSessionApi.startSession(payload),
    onSuccess: (data, variables) => {
      // Save tenant settings to sessionStorage for use across the app
      if (data.data.tenant.settings) {
        saveTenantSettings(data.data.tenant.settings);
        console.log('[StartSession] Tenant settings saved:', data.data.tenant.settings);
      }
      
      // Save tenant info
      saveTenantInfo({
        name: data.data.tenant.name,
        address: data.data.tenant.address || null,
        image: data.data.tenant.image || null,
      });
      
      // Invalidate table context query to refresh data
      queryClient.invalidateQueries({
        queryKey: tableContextQueryKeys.detail(
          variables.tenantSlug,
          variables.tableCode,
        ),
      });
    },
  });
}

/**
 * Hook to validate an existing session
 */
export function useValidateSessionMutation() {
  return useMutation<{ valid: boolean; expiresAt?: string }, Error, string>({
    mutationFn: (sessionToken) => tableSessionApi.getSession(sessionToken),
  });
}
