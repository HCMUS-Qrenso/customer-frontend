import type { BillDTO } from '@/lib/types/checkout';

/**
 * Extended bill item type for UI display
 */
export type ExtendedBillItem = BillDTO['items'][0] & { 
  image?: string; 
  note?: string; 
  addedAt: string;
};

/**
 * Mock bill data for development
 */
export const mockBill: BillDTO & { items: ExtendedBillItem[] } = {
  id: 'bill-1',
  orderId: 'ord-1',
  orderNumber: 'A123',
  items: [
    {
      id: '1',
      name: 'Phở Bò Tái',
      nameEn: 'Rare Beef Pho',
      price: 75000,
      quantity: 2,
      modifiers: 'Size Lớn, Thêm thịt',
      image: 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=400',
      addedAt: new Date(Date.now() - 30 * 60000).toISOString(),
    },
    {
      id: '2',
      name: 'Bánh Mì Thịt Nướng',
      nameEn: 'Grilled Pork Banh Mi',
      price: 35000,
      quantity: 1,
      image: 'https://images.unsplash.com/photo-1600688640154-9619e002df30?w=400',
      addedAt: new Date(Date.now() - 30 * 60000).toISOString(),
    },
    {
      id: '3',
      name: 'Trà Đá',
      nameEn: 'Iced Tea',
      price: 10000,
      quantity: 3,
      note: 'Ít đường',
      addedAt: new Date(Date.now() - 15 * 60000).toISOString(),
    },
  ],
  subtotal: 215000,
  serviceCharge: 10750,
  tax: 0,
  total: 225750,
  status: 'unpaid',
};
