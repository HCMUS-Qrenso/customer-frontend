import type { CartItemDTO, MenuItemDTO } from '@/lib/types/menu';

/**
 * Mock cart items for development
 */
export const mockCartItems: CartItemDTO[] = [
  {
    menuItemId: '1',
    menuItemName: 'Phở Bò Tái',
    menuItemNameEn: 'Rare Beef Pho',
    quantity: 2,
    basePrice: 75000,
    image: 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=400',
    selectedModifiers: [
      { groupId: 'g1', groupName: 'Size', modifierId: 'm1', modifierName: 'Lớn', price: 15000 },
    ],
    notes: 'Ít hành',
    totalPrice: 180000,
  },
  {
    menuItemId: '2',
    menuItemName: 'Bánh Mì Thịt Nướng',
    menuItemNameEn: 'Grilled Pork Banh Mi',
    quantity: 1,
    basePrice: 35000,
    image: 'https://images.unsplash.com/photo-1600688640154-9619e002df30?w=400',
    selectedModifiers: [],
    totalPrice: 35000,
  },
  {
    menuItemId: '3',
    menuItemName: 'Trà Đá',
    menuItemNameEn: 'Iced Tea',
    quantity: 3,
    basePrice: 10000,
    selectedModifiers: [],
    totalPrice: 30000,
  },
];

/**
 * Mock upsell items for cart page
 */
export const mockUpsellItems: MenuItemDTO[] = [
  {
    id: 'u1',
    name: 'Chè Ba Màu',
    description: 'Three-color dessert',
    base_price: 25000,
    status: 'available',
    category: { id: 'cat1', name: 'Dessert' },
    images: [{ id: 'img1', image_url: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400', display_order: 0 }],
    created_at: '',
    updated_at: '',
  },
  {
    id: 'u2',
    name: 'Nước Ép Cam',
    description: 'Fresh orange juice',
    base_price: 35000,
    status: 'available',
    category: { id: 'cat2', name: 'Drinks' },
    images: [{ id: 'img2', image_url: 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=400', display_order: 0 }],
    created_at: '',
    updated_at: '',
  },
  {
    id: 'u3',
    name: 'Bánh Flan',
    description: 'Caramel custard',
    base_price: 20000,
    status: 'available',
    category: { id: 'cat1', name: 'Dessert' },
    images: [{ id: 'img3', image_url: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400', display_order: 0 }],
    created_at: '',
    updated_at: '',
  },
];
