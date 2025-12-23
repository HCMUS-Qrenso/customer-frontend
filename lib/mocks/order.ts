import type { OrderDTO, OrderItemDTO } from '@/lib/types/order';

/**
 * Mock order data for development
 */
export const mockOrder: OrderDTO = {
  id: 'ord-1',
  orderNumber: 'A123',
  tableId: 'table-1',
  status: 'preparing',
  items: [
    {
      id: '1',
      name: 'Phở Bò Tái',
      nameEn: 'Rare Beef Pho',
      price: 75000,
      quantity: 2,
      modifiers: 'Size Lớn, Thêm thịt',
      image: 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=400',
      status: 'preparing',
      addedAt: new Date(Date.now() - 30 * 60000).toISOString(),
    },
    {
      id: '2',
      name: 'Bánh Mì Thịt Nướng',
      nameEn: 'Grilled Pork Banh Mi',
      price: 35000,
      quantity: 1,
      image: 'https://images.unsplash.com/photo-1600688640154-9619e002df30?w=400',
      status: 'ready',
      addedAt: new Date(Date.now() - 30 * 60000).toISOString(),
    },
    {
      id: '3',
      name: 'Trà Đá',
      nameEn: 'Iced Tea',
      price: 10000,
      quantity: 3,
      note: 'Ít đường',
      status: 'served',
      addedAt: new Date(Date.now() - 15 * 60000).toISOString(),
    },
  ] as OrderItemDTO[],
  subtotal: 215000,
  serviceCharge: 10750,
  tax: 0,
  total: 225750,
  createdAt: new Date().toISOString(),
};

/**
 * Order polling config
 */
export const ORDER_POLLING_CONFIG = {
  enabled: true,
  interval: 10000, // 10 seconds
};
