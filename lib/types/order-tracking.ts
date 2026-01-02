/**
 * Order Tracking Types
 * Types for order tracking page with batch-based item grouping
 */

export type OrderItemStatus =
  | "pending"
  | "preparing"
  | "ready"
  | "served"
  | "cancelled";

export interface OrderTrackingItem {
  id: string;
  name: string;
  quantity: number;
  status: OrderItemStatus;
  image?: string;
  modifiers?: string;
  note?: string;
  price: number;
}

export interface OrderBatch {
  id: string;
  batchNumber: number;
  addedAt: string;
  addedAtFormatted: string;
  items: OrderTrackingItem[];
  status: "pending" | "preparing" | "ready" | "served";
}
