import type { BillDTO, CheckoutResultDTO } from "@/lib/types/checkout";

/**
 * Mock bill data for checkout page
 */
export const mockCheckoutBill: BillDTO = {
  id: "bill-1",
  orderId: "ord-1",
  orderNumber: "A123",
  items: [
    {
      id: "1",
      name: "Phở Bò Tái",
      price: 75000,
      quantity: 2,
      modifiers: "Size Lớn",
    },
    { id: "2", name: "Bánh Mì Thịt Nướng", price: 35000, quantity: 1 },
    { id: "3", name: "Trà Đá", price: 10000, quantity: 3 },
  ],
  subtotal: 215000,
  serviceCharge: 10750,
  tax: 21500,
  total: 247250,
  status: "unpaid",
};

/**
 * Mock checkout result data
 */
export const mockCheckoutResult: CheckoutResultDTO = {
  success: true,
  transactionId: "TXN-1234567890",
  paymentMethod: "card",
  amountPaid: 252195,
  timestamp: new Date().toISOString(),
};

/**
 * Mock order tracking data
 */
export const mockOrderTracking = {
  id: "order-001",
  orderNumber: "#8821",
  status: "preparing" as const,
  createdAt: "12:30 PM",
  updatedAt: "Just now",
  batches: [
    {
      id: "batch-2",
      batchNumber: 2,
      createdAt: "12:45 PM",
      itemCount: 3,
      status: "preparing" as const,
      items: [
        {
          id: "item-1",
          name: "Phở Bò",
          nameEn: "Pho Bo",
          quantity: 2,
          price: 150000,
          image:
            "https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=400",
          modifiers: "Size L, No onions",
          status: "preparing" as const,
        },
        {
          id: "item-2",
          name: "Gỏi Cuốn",
          nameEn: "Spring Rolls",
          quantity: 1,
          price: 50000,
          image:
            "https://images.unsplash.com/photo-1562967916-eb82221dfb92?w=400",
          modifiers: "Peanut sauce",
          status: "ready" as const,
        },
      ],
    },
    {
      id: "batch-1",
      batchNumber: 1,
      createdAt: "12:30 PM",
      itemCount: 1,
      status: "served" as const,
      items: [
        {
          id: "item-3",
          name: "Bánh Mì Đặc Biệt",
          nameEn: "Banh Mi Special",
          quantity: 1,
          price: 45000,
          image:
            "https://images.unsplash.com/photo-1600688640154-9619e002df30?w=400",
          modifiers: "Less spicy",
          status: "served" as const,
        },
      ],
    },
  ],
  timeline: [
    { time: "12:50 PM", message: "Kitchen started preparing Batch 2" },
    { time: "12:45 PM", message: "Batch 2 added (3 items)" },
    { time: "12:40 PM", message: "Batch 1 Served" },
    { time: "12:30 PM", message: "Order Created" },
  ],
};
