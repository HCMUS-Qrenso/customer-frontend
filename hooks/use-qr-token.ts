"use client";

import { useEffect } from "react";
import { setQrToken, setTableId } from "@/lib/stores/qr-token-store";

/**
 * Hook to store QR token and table ID in global store with sessionStorage persistence
 * Replaces repeated useEffect pattern across client components
 */
export function useQrToken(token?: string, tableId?: string) {
  useEffect(() => {
    if (token) {
      setQrToken(token);
    }
    if (tableId) {
      setTableId(tableId);
    }
  }, [token, tableId]);
}
