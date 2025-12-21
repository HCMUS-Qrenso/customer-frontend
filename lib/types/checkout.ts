// Checkout Types

// Payment Method
export type PaymentMethod = 'e-wallet' | 'card' | 'counter';

// Bill Item DTO
export interface BillItemDTO {
  id: string;
  name: string;
  nameEn?: string;
  price: number;
  quantity: number;
  modifiers?: string;
}

// Bill DTO
export interface BillDTO {
  id: string;
  orderId: string;
  orderNumber: string;
  items: BillItemDTO[];
  subtotal: number;
  serviceCharge: number;
  tax: number;
  discount?: number;
  total: number;
  status: 'unpaid' | 'paid' | 'partial';
}

// Checkout Result DTO
export interface CheckoutResultDTO {
  success: boolean;
  transactionId?: string;
  paymentMethod?: PaymentMethod;
  amountPaid?: number;
  timestamp?: string;
  error?: string;
}
