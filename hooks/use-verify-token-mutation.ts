import { useMutation } from "@tanstack/react-query";
import { verifyTokenApi } from "@/lib/api/verify-token";
import type { VerifyTokenResponse } from "@/lib/types/table";

/**
 * Hook to verify a QR code token
 * Used when customer scans a QR code to validate it
 */
export function useVerifyTokenMutation() {
  return useMutation<VerifyTokenResponse, Error, string>({
    mutationFn: (token) => verifyTokenApi.verifyToken(token),
  });
}
