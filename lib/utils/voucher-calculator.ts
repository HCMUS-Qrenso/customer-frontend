/**
 * Voucher Calculator
 * Client-side voucher discount calculation utilities
 * Mirrors backend logic for preview before order creation
 */

import type { PublicVoucher, AppliedVoucher, DiscountType } from "@/lib/api/voucher";

/**
 * Calculate discount amount for a voucher
 * Matches backend VouchersService.calculateDiscount logic
 */
export function calculateVoucherDiscount(
  voucher: Pick<PublicVoucher, "discountType" | "percentOff" | "amountOff" | "maxDiscountAmount">,
  subtotal: number
): number {
  let discount = 0;

  if (voucher.discountType === "percent" && voucher.percentOff) {
    discount = subtotal * (voucher.percentOff / 100);

    // Apply max cap
    if (voucher.maxDiscountAmount) {
      discount = Math.min(discount, voucher.maxDiscountAmount);
    }
  } else if (voucher.discountType === "fixed_amount" && voucher.amountOff) {
    discount = voucher.amountOff;
  }

  // Never discount more than the subtotal
  return Math.min(Math.round(discount), subtotal);
}

/**
 * Check if a voucher meets the minimum subtotal requirement
 */
export function isVoucherApplicable(
  voucher: Pick<PublicVoucher, "minSubtotal">,
  subtotal: number
): boolean {
  if (voucher.minSubtotal && subtotal < voucher.minSubtotal) {
    return false;
  }
  return true;
}

/**
 * Get validation error message for a voucher
 * Returns null if voucher is valid
 */
export function getVoucherValidationError(
  voucher: PublicVoucher,
  subtotal: number
): string | null {
  // Check minimum subtotal
  if (voucher.minSubtotal && subtotal < voucher.minSubtotal) {
    return `Đơn hàng tối thiểu ${formatCurrency(voucher.minSubtotal)} để áp dụng mã này`;
  }

  // Check if voucher is expired
  if (voucher.endsAt) {
    const endsAt = new Date(voucher.endsAt);
    if (endsAt < new Date()) {
      return "Mã giảm giá đã hết hạn";
    }
  }

  // Check if voucher hasn't started yet
  if (voucher.startsAt) {
    const startsAt = new Date(voucher.startsAt);
    if (startsAt > new Date()) {
      return "Mã giảm giá chưa có hiệu lực";
    }
  }

  return null;
}

/**
 * Format voucher discount description for display
 */
export function formatVoucherDescription(
  voucher: Pick<PublicVoucher, "discountType" | "percentOff" | "amountOff" | "maxDiscountAmount">
): string {
  if (voucher.discountType === "percent" && voucher.percentOff) {
    let description = `Giảm ${voucher.percentOff}%`;
    if (voucher.maxDiscountAmount) {
      description += ` (tối đa ${formatCurrency(voucher.maxDiscountAmount)})`;
    }
    return description;
  }

  if (voucher.discountType === "fixed_amount" && voucher.amountOff) {
    return `Giảm ${formatCurrency(voucher.amountOff)}`;
  }

  return "Giảm giá";
}

/**
 * Simple currency formatter for Vietnamese Dong
 */
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
}

/**
 * Find voucher in public vouchers list by code
 */
export function findVoucherByCode(
  vouchers: PublicVoucher[],
  code: string
): PublicVoucher | undefined {
  const normalizedCode = code.trim().toUpperCase();
  return vouchers.find(
    (v) => v.code.toUpperCase() === normalizedCode
  );
}

/**
 * Create AppliedVoucher from PublicVoucher and calculated discount
 */
export function createAppliedVoucher(
  voucher: PublicVoucher,
  discountAmount: number,
  isAutoApplied: boolean = false
): AppliedVoucher {
  return {
    redemptionId: `preview_${voucher.id}`, // Placeholder for preview
    voucherId: voucher.id,
    code: voucher.code,
    name: voucher.name,
    discountType: voucher.discountType,
    percentOff: voucher.percentOff,
    amountOff: voucher.amountOff,
    discountAmount,
    isAutoApplied,
  };
}

/**
 * Find the best auto-apply voucher from list
 * Returns voucher with highest priority that is applicable
 */
export function findBestAutoApplyVoucher(
  vouchers: PublicVoucher[],
  subtotal: number
): PublicVoucher | null {
  // Filter to auto-apply vouchers that meet minimum requirements and are valid
  const eligible = vouchers
    .filter((v) => {
      if (!v.autoApply) return false;
      if (!isVoucherApplicable(v, subtotal)) return false;
      if (getVoucherValidationError(v, subtotal)) return false;
      return true;
    })
    .sort((a, b) => (b.priority || 0) - (a.priority || 0));

  return eligible[0] || null;
}

/**
 * Sort vouchers by priority (desc), then by discount amount (desc)
 */
export function sortVouchersByPriorityAndDiscount(
  vouchers: PublicVoucher[],
  subtotal: number
): PublicVoucher[] {
  return [...vouchers].sort((a, b) => {
    // Priority first
    const priorityDiff = (b.priority || 0) - (a.priority || 0);
    if (priorityDiff !== 0) return priorityDiff;

    // Then by discount amount
    return calculateVoucherDiscount(b, subtotal) - calculateVoucherDiscount(a, subtotal);
  });
}

/**
 * Get applicable vouchers (those that meet min subtotal requirement)
 */
export function getApplicableVouchers(
  vouchers: PublicVoucher[],
  subtotal: number
): PublicVoucher[] {
  return vouchers.filter((v) => {
    if (!isVoucherApplicable(v, subtotal)) return false;
    if (getVoucherValidationError(v, subtotal)) return false;
    return true;
  });
}

