// Formatting utilities

/**
 * Format a number as Vietnamese Dong currency
 * @param price - Price in VND (no decimal)
 * @returns Formatted string like "120.000₫"
 */
export function formatVND(price: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'decimal',
    maximumFractionDigits: 0,
  }).format(price) + '₫';
}

/**
 * Format a number as USD currency
 * @param price - Price in USD
 * @returns Formatted string like "$12.50"
 */
export function formatUSD(price: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(price);
}
