/**
 * Order API
 * API layer for order operations using session token
 */

import { apiClient } from './client';
import { getSessionToken } from '@/lib/stores/qr-token-store';
import type { CartItemDTO } from '@/lib/types/menu';

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
  } | null;
  message?: string;
}

// ============================================
// Helper Functions
// ============================================

/**
 * Create auth config with session token for API requests
 */
function getAuthConfig() {
  const token = getSessionToken();
  return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
}

/**
 * Convert cart items to API payload format
 */
function cartItemsToPayload(cartItems: CartItemDTO[]): CreateOrderItemPayload[] {
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
   * Requires session token
   */
  createOrder: async (
    cartItems: CartItemDTO[],
    specialInstructions?: string
  ): Promise<OrderResponse> => {
    const payload: CreateOrderPayload = {
      items: cartItemsToPayload(cartItems),
      special_instructions: specialInstructions,
    };

    const { data } = await apiClient.post<OrderResponse>(
      '/orders',
      payload,
      getAuthConfig()
    );
    return data;
  },

  /**
   * Get current order for this session
   * Returns null if no active order exists
   */
  getMyOrder: async (): Promise<OrderResponse> => {
    const { data } = await apiClient.get<OrderResponse>(
      '/orders/my-order',
      getAuthConfig()
    );
    return data;
  },

  /**
   * Add items to an existing order
   */
  addItemsToOrder: async (
    orderId: string,
    cartItems: CartItemDTO[]
  ): Promise<OrderResponse> => {
    const payload = {
      items: cartItemsToPayload(cartItems),
    };

    const { data } = await apiClient.post<OrderResponse>(
      `/orders/${orderId}/items`,
      payload,
      getAuthConfig()
    );
    return data;
  },

  /**
   * Get order by ID (for order tracking)
   */
  getOrder: async (orderId: string): Promise<OrderResponse> => {
    const { data } = await apiClient.get<OrderResponse>(
      `/orders/${orderId}`,
      getAuthConfig()
    );
    return data;
  },
};
