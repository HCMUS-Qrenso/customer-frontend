/**
 * Payment API
 * API layer for payment operations
 */

import { apiClient } from "./client";

// ============================================
// Request/Response Types
// ============================================

export interface RequestBillPayload {
  orderId: string;
  notes?: string;
}

export interface RequestBillResponse {
  success: boolean;
  message: string;
  orderId: string;
  orderNumber: string;
}

// ============================================
// API Functions
// ============================================

/**
 * Request bill for an order
 * Sends notification to waiter
 */
export async function requestBill(
  payload: RequestBillPayload,
): Promise<RequestBillResponse> {
  const response = await apiClient.post<RequestBillResponse>(
    "/payments/request-bill",
    payload,
  );
  return response.data;
}
