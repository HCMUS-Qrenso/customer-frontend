/**
 * Group Items Utility
 * Groups order items by their creation time into batches
 */

import { formatTime } from '@/lib/format';
import type { OrderItemResponse } from '@/lib/api/order';
import type { OrderBatch, OrderTrackingItem, OrderItemStatus } from '@/lib/types/order-tracking';

/**
 * Round timestamp to the nearest minute for grouping
 * Items added within the same minute are grouped together
 */
function roundToMinute(dateStr: string): string {
  const date = new Date(dateStr);
  date.setSeconds(0, 0);
  return date.toISOString();
}

/**
 * Determine the aggregate status of a batch based on its items
 */
function getBatchStatus(items: OrderTrackingItem[]): 'pending' | 'preparing' | 'ready' | 'served' {
  const statuses = items.map(item => item.status);
  
  // If all served, batch is served
  if (statuses.every(s => s === 'served')) return 'served';
  
  // If all ready or served, batch is ready
  if (statuses.every(s => s === 'ready' || s === 'served')) return 'ready';
  
  // If any preparing, batch is preparing
  if (statuses.some(s => s === 'preparing')) return 'preparing';
  
  // Otherwise pending
  return 'pending';
}

/**
 * Transform API OrderItemResponse to OrderTrackingItem
 */
function transformToTrackingItem(item: OrderItemResponse): OrderTrackingItem {
  return {
    id: item.id,
    name: item.menuItem.name,
    quantity: item.quantity,
    status: item.status as OrderItemStatus,
    image: item.menuItem.image,
    modifiers: item.modifiers?.map(m => m.name).join(', '),
    note: item.specialInstructions,
    price: item.subtotal,
  };
}

/**
 * Group order items by their creation time into batches
 * Each batch represents items added at roughly the same time
 */
export function groupItemsIntoBatches(items: OrderItemResponse[]): OrderBatch[] {
  if (!items || items.length === 0) return [];

  // Group items by rounded creation time
  const groups: Record<string, OrderItemResponse[]> = {};
  
  items.forEach(item => {
    const timeKey = roundToMinute(item.createdAt);
    if (!groups[timeKey]) {
      groups[timeKey] = [];
    }
    groups[timeKey].push(item);
  });

  // Convert groups to batches, sorted by time
  const sortedTimes = Object.keys(groups).sort(
    (a, b) => new Date(a).getTime() - new Date(b).getTime()
  );

  return sortedTimes.map((time, index) => {
    const batchItems = groups[time].map(transformToTrackingItem);
    
    return {
      id: `batch-${index + 1}`,
      batchNumber: index + 1,
      addedAt: time,
      addedAtFormatted: formatTime(time),
      items: batchItems,
      status: getBatchStatus(batchItems),
    };
  });
}

/**
 * Get display text for batch status
 */
export function getBatchStatusText(status: OrderBatch['status']): string {
  switch (status) {
    case 'pending':
      return 'Đang chờ';
    case 'preparing':
      return 'Đang chuẩn bị';
    case 'ready':
      return 'Sẵn sàng';
    case 'served':
      return 'Đã phục vụ';
    default:
      return status;
  }
}

/**
 * Get CSS classes for batch status badge
 */
export function getBatchStatusClasses(status: OrderBatch['status']): string {
  switch (status) {
    case 'pending':
      return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
    case 'preparing':
      return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
    case 'ready':
      return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';
    case 'served':
      return 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300';
    default:
      return 'bg-gray-100 text-gray-600';
  }
}
