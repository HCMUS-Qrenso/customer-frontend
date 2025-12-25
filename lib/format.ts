// Formatting utilities

/**
 * Format a number as Vietnamese Dong currency
 * @param price - Price in VND (no decimal)
 * @returns Formatted string like "120.000₫"
 */
export function formatVND(price: number): string {
  return (
    new Intl.NumberFormat("vi-VN", {
      style: "decimal",
      maximumFractionDigits: 0,
    }).format(price) + "₫"
  );
}

/**
 * Format a number as currency
 * @param price - Price value
 * @param currency - Currency code ('VND' or 'USD'), defaults to 'VND'
 * @returns Formatted string with currency symbol
 */
export function formatCurrency(
  price: number,
  currency: "VND" | "USD" = "VND",
): string {
  if (currency === "VND") {
    return formatVND(price);
  }

  // USD formatting
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(price);
}

/**
 * @deprecated Use formatCurrency() instead. This was incorrectly named.
 * Format a number as VND currency (not USD!)
 * @param price - Price in VND
 * @returns Formatted string like "120.000₫"
 */
export function formatUSD(price: number): string {
  return formatVND(price);
}

/**
 * Format a date string to time in Vietnamese locale (HH:mm)
 * @param dateString - ISO date string
 * @returns Formatted time string like "14:30"
 */
export function formatTime(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}
