"use client";

import { useEffect } from "react";
import { setQrToken } from "@/lib/stores/qr-token-store";

/**
 * Hook to store QR token in global store
 * Replaces repeated useEffect pattern across client components
 */
export function useQrToken(token?: string) {
  useEffect(() => {
    if (token) {
      setQrToken(token);
    }
  }, [token]);
}
