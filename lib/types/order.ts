// Order Types

export type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'ready' | 'served' | 'completed' | 'cancelled';

export interface OrderItemDTO {
  id: string;
  name: string;
  nameEn?: string;
  price: number;
  quantity: number;
  image?: string;
  modifiers?: string;
  note?: string;
  status: OrderStatus;
  addedAt: string;
}

export interface OrderDTO {
  id: string;
  orderNumber: string;
  tableId: string;
  status: OrderStatus;
  items: OrderItemDTO[];
  subtotal: number;
  serviceCharge: number;
  tax: number;
  discount?: number;
  voucherCode?: string;
  total: number;
  createdAt: string;
}
