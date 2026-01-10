/**
 * Order API
 * API layer for order operations using session token
 *
 * Note: Session token is automatically added via apiClient interceptor
 * using x-table-session-token header (v2.0)
 */

import { apiClient } from "./client";
import type { CartItemDTO } from "@/lib/types/menu";

// ============================================
// Request/Response Types
// ============================================

export interface CreateOrderItemPayload {
  menu_item_id: string;
  quantity: number;
  modifiers?: { modifier_id: string }[];
  special_instructions?: string;
}

export interface CreateOrderPayload {
  items: CreateOrderItemPayload[];
  special_instructions?: string;
}

export interface OrderItemResponse {
  id: string;
  menuItem: {
    id: string;
    name: string;
    description?: string;
    image?: string;
  };
  quantity: number;
  unitPrice: number;
  modifiersTotal: number;
  subtotal: number;
  status: string;
  specialInstructions?: string;
  modifiers: {
    id: string;
    name: string;
    priceAdjustment: number;
  }[];
  createdAt: string; // When this item was added to the order
}

export interface OrderResponse {
  success: boolean;
  data: {
    id: string;
    orderNumber: string;
    status: string;
    priority: string;
    paymentStatus: string;
    table: {
      id: string;
      tableNumber: string;
      zone?: { id: string; name: string };
    };
    items: OrderItemResponse[];
    subtotal: number;
    taxAmount: number;
    discountAmount: number;
    totalAmount: number;
    specialInstructions?: string;
    createdAt: string;
    updatedAt: string;
    // Voucher fields
    voucherCode?: string;
    voucher?: {
      id: string;
      code: string;
      name: string;
      discountType: string;
      percentOff?: number;
      amountOff?: number;
    };
  } | null;
  message?: string;
}

export interface OrderHistoryItem {
  id: string;
  orderNumber: string;
  status: string;
  priority: string;
  paymentStatus: string;
  table: {
    id: string;
    tableNumber: string;
    zone?: { id: string; name: string };
  };
  tenant: {
    id: string;
    name: string;
    slug: string;
  };
  items: {
    id: string;
    name: string;
    quantity: number;
    status: string;
    subtotal: number;
  }[];
  itemCount: number;
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  specialInstructions?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderHistoryResponse {
  success: boolean;
  data: OrderHistoryItem[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ============================================
// Helper Functions
// ============================================

/**
 * Convert cart items to API payload format
 */
function cartItemsToPayload(
  cartItems: CartItemDTO[],
): CreateOrderItemPayload[] {
  return cartItems.map((item) => ({
    menu_item_id: item.menuItemId,
    quantity: item.quantity,
    modifiers: item.selectedModifiers?.map((m) => ({
      modifier_id: m.modifierId,
    })),
    special_instructions: item.notes,
  }));
}

// ============================================
// API Functions
// ============================================

export const orderApi = {
  /**
   * Create a new order with cart items
   * Requires session token (automatically added via apiClient interceptor)
   * Uses x-table-session-token header (v2.0)
   */
  createOrder: async (
    cartItems: CartItemDTO[],
    specialInstructions?: string,
  ): Promise<OrderResponse> => {
    const payload: CreateOrderPayload = {
      items: cartItemsToPayload(cartItems),
      special_instructions: specialInstructions,
    };

    // apiClient interceptor automatically adds x-table-session-token header
    const { data } = await apiClient.post<OrderResponse>("/orders", payload);
    return data;
  },

  /**
   * Get current order for this session
   * Returns null if no active order exists
   * Uses x-table-session-token header (v2.0)
   */
  getMyOrder: async (): Promise<OrderResponse> => {
    // apiClient interceptor automatically adds x-table-session-token header
    const { data } = await apiClient.get<OrderResponse>("/orders/my-order");
    return data;
  },

  /**
   * Add items to an existing order
   * Uses x-table-session-token header (v2.0)
   */
  addItemsToOrder: async (
    orderId: string,
    cartItems: CartItemDTO[],
  ): Promise<OrderResponse> => {
    const payload = {
      items: cartItemsToPayload(cartItems),
    };

    // apiClient interceptor automatically adds x-table-session-token header
    const { data } = await apiClient.post<OrderResponse>(
      `/orders/${orderId}/items`,
      payload,
    );
    return data;
  },

  /**
   * Get order by ID (for order tracking)
   * Uses x-table-session-token header (v2.0)
   */
  getOrder: async (orderId: string): Promise<OrderResponse> => {
    // apiClient interceptor automatically adds x-table-session-token header
    const { data } = await apiClient.get<OrderResponse>(`/orders/${orderId}`);
    return data;
  },

  /**
   * Get order by ID for authenticated customer (from order history)
   * Requires JWT authentication (accessToken)
   */
  getMyOrderById: async (orderId: string): Promise<OrderResponse> => {
    // apiClient interceptor automatically adds Authorization header with accessToken
    const { data } = await apiClient.get<OrderResponse>(
      `/orders/my-orders/${orderId}`,
    );
    return data;
  },

  /**
   * Get order history for authenticated customer
   * Requires JWT authentication (accessToken)
   */
  getMyOrders: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
    payment_status?: string;
    date_from?: string;
    date_to?: string;
    search?: string;
    sort_by?: string;
    sort_order?: "asc" | "desc";
  }): Promise<OrderHistoryResponse> => {
    // apiClient interceptor automatically adds Authorization header with accessToken
    const { data } = await apiClient.get<OrderHistoryResponse>(
      "/orders/my-orders",
      { params },
    );
    return data;
  },
};
