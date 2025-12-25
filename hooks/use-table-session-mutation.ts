import { useMutation, useQueryClient } from "@tanstack/react-query";
import { tableSessionApi } from "@/lib/api/table-session";
import { tableContextQueryKeys } from "./use-table-context-query";
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
    onSuccess: (_, variables) => {
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
