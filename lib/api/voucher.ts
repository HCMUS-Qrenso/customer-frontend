/**
 * Voucher API
 * API layer for customer voucher operations
 *
 * Note: Session token is automatically added via apiClient interceptor
 * using x-table-session-token header (v2.0)
 */

import { apiClient } from "./client";

// ============================================
// Types
// ============================================

export type VoucherKind = "automatic" | "staff_only" | "code";
export type DiscountType = "percent" | "fixed_amount";

export interface PublicVoucher {
  id: string;
  code: string;
  name: string;
  description: string | null;
  kind: VoucherKind;
  discountType: DiscountType;
  percentOff: number | null;
  amountOff: number | null;
  maxDiscountAmount: number | null;
  minSubtotal: number | null;
  minParty: number | null;
  startsAt: string | null;
  endsAt: string | null;
  autoApply: boolean;
  priority?: number;
  isUsedInSession?: boolean;
}

export interface VoucherListResponse {
  success: boolean;
  data: PublicVoucher[];
  message?: string;
}

export interface ApplyVoucherResponse {
  success: boolean;
  data: {
    redemptionId: string;
    discountAmount: number;
    updatedTotal: number;
    voucher: {
      id: string;
      code: string;
      name: string;
      discountType: DiscountType;
      percentOff: number | null;
      amountOff: number | null;
    };
  } | null;
  message?: string;
}

export interface AppliedVoucher {
  redemptionId: string;
  voucherId: string;
  code: string;
  name: string;
  discountType: DiscountType;
  percentOff: number | null;
  amountOff: number | null;
  discountAmount: number;
  isAutoApplied?: boolean;
}

// ============================================
// API Functions
// ============================================

export const voucherApi = {
  /**
   * Get public vouchers available for current tenant
   * Uses session token to identify tenant
   */
  getPublicVouchers: async (): Promise<VoucherListResponse> => {
    const { data } = await apiClient.get<VoucherListResponse>(
      "/vouchers/customer-available",
    );
    return data;
  },

  /**
   * Apply a voucher code to the current order
   * @param orderId - Order ID to apply voucher to
   * @param code - Voucher code entered by customer
   */
  applyVoucherCode: async (
    orderId: string,
    code: string,
  ): Promise<ApplyVoucherResponse> => {
    const { data } = await apiClient.post<ApplyVoucherResponse>(
      `/orders/${orderId}/vouchers/apply-code`,
      { code },
    );
    return data;
  },

  /**
   * Remove applied voucher from order
   * @param orderId - Order ID
   * @param redemptionId - Voucher redemption ID to remove
   */
  removeVoucher: async (
    orderId: string,
    redemptionId: string,
  ): Promise<{ success: boolean; message?: string }> => {
    const { data } = await apiClient.delete(
      `/orders/${orderId}/vouchers/${redemptionId}`,
      { data: { reason: "Customer removed voucher" } },
    );
    return data;
  },
};
