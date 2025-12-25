import { apiClient } from "./client";
import type { VerifyTokenResponse } from "@/lib/types/table";

export interface VerifyTokenRequest {
  token: string;
}

export const verifyTokenApi = {
  /**
   * Verify a QR code token
   * Used to validate scanned QR codes
   */
  verifyToken: async (token: string): Promise<VerifyTokenResponse> => {
    const { data } = await apiClient.post<VerifyTokenResponse>(
      "/tables/verify-token",
      {
        token,
      },
    );
    return data;
  },
};
