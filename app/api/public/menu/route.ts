import { NextRequest, NextResponse } from 'next/server';
import { MenuListDTO, CategoryDTO, MenuItemDTO } from '@/app/lib/types/menu-types';

// Mock Categories
const MOCK_CATEGORIES: CategoryDTO[] = [
  { id: 'cat_burgers', name: 'Burgers', nameEn: 'Burgers', displayOrder: 1 },
  { id: 'cat_bowls', name: 'Bowls', nameEn: 'Bowls', displayOrder: 2 },
  { id: 'cat_sides', name: 'Sides', nameEn: 'Sides', displayOrder: 3 },
  { id: 'cat_drinks', name: 'Đồ uống', nameEn: 'Drinks', displayOrder: 4 },
  { id: 'cat_dessert', name: 'Tráng miệng', nameEn: 'Dessert', displayOrder: 5 },
];

// Mock Menu Items
const MOCK_ITEMS: MenuItemDTO[] = [
  // Burgers - Chef Recommendations
  {
    id: 'item_001',
    name: 'Truffle Supreme',
    nameEn: 'Truffle Supreme',
    description: 'Wagyu beef patty, black truffle mayo, caramelized onions, swiss cheese',
    descriptionEn: 'Wagyu beef patty, black truffle mayo, caramelized onions, swiss cheese',
    price: 16.50,
    status: 'available',
    isChefRecommendation: true,
    popularityScore: 95,
    categoryId: 'cat_burgers',
    primaryImageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&q=80',
    hasModifiers: true,
    badges: ['POPULAR'],
  },
  {
    id: 'item_002',
    name: 'Nashville Hot',
    nameEn: 'Nashville Hot',
    description: 'Crispy chicken breast dipped in our signature hot oil, pickles, coleslaw',
    descriptionEn: 'Crispy chicken breast dipped in our signature hot oil, pickles, coleslaw',
    price: 14.00,
    status: 'available',
    isChefRecommendation: true,
    popularityScore: 88,
    categoryId: 'cat_burgers',
    primaryImageUrl: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=400&q=80',
    hasModifiers: true,
    badges: ['HOT'],
  },
  {
    id: 'item_003',
    name: 'The Double Smash',
    nameEn: 'The Double Smash',
    description: 'Two smashed patties, double american cheese, house sauce',
    descriptionEn: 'Two smashed patties, double american cheese, house sauce',
    price: 15.50,
    status: 'available',
    isChefRecommendation: true,
    popularityScore: 92,
    categoryId: 'cat_burgers',
    primaryImageUrl: 'https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=400&q=80',
    hasModifiers: true,
    badges: [],
  },
  // Regular Burgers
  {
    id: 'item_004',
    name: 'Classic Cheese',
    nameEn: 'Classic Cheese',
    description: '1/4lb beef patty, american cheese, lettuce, tomato, secret sauce',
    descriptionEn: '1/4lb beef patty, american cheese, lettuce, tomato, secret sauce',
    price: 12.50,
    status: 'available',
    isChefRecommendation: false,
    popularityScore: 75,
    categoryId: 'cat_burgers',
    primaryImageUrl: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=400&q=80',
    hasModifiers: true,
    badges: [],
  },
  {
    id: 'item_005',
    name: 'Bacon Deluxe',
    nameEn: 'Bacon Deluxe',
    description: 'Smoked bacon, bbq sauce, crispy onions',
    descriptionEn: 'Smoked bacon, bbq sauce, crispy onions',
    price: 14.00,
    status: 'available',
    isChefRecommendation: false,
    popularityScore: 70,
    categoryId: 'cat_burgers',
    primaryImageUrl: 'https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?w=400&q=80',
    hasModifiers: true,
    badges: [],
  },
  {
    id: 'item_006',
    name: 'Mushroom Swiss',
    nameEn: 'Mushroom Swiss',
    description: 'Sautéed mushrooms, swiss cheese, mayo',
    descriptionEn: 'Sautéed mushrooms, swiss cheese, mayo',
    price: 13.50,
    status: 'sold_out',
    isChefRecommendation: false,
    popularityScore: 65,
    categoryId: 'cat_burgers',
    primaryImageUrl: 'https://images.unsplash.com/photo-1572802419224-296b0aeee0d9?w=400&q=80',
    hasModifiers: false,
    badges: [],
  },
  {
    id: 'item_007',
    name: 'Junior Burger',
    nameEn: 'Junior Burger',
    description: 'Perfect for kids. Just ketchup and cheese',
    descriptionEn: 'Perfect for kids. Just ketchup and cheese',
    price: 8.00,
    status: 'available',
    isChefRecommendation: false,
    popularityScore: 50,
    categoryId: 'cat_burgers',
    primaryImageUrl: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=400&q=80',
    hasModifiers: false,
    badges: [],
  },
  {
    id: 'item_008',
    name: 'Volcano Burger',
    nameEn: 'Volcano Burger',
    description: 'Extra spicy sauce, jalapeños, pepper jack',
    descriptionEn: 'Extra spicy sauce, jalapeños, pepper jack',
    price: 14.50,
    status: 'available',
    isChefRecommendation: true,
    popularityScore: 78,
    categoryId: 'cat_burgers',
    primaryImageUrl: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=400&q=80',
    hasModifiers: true,
    badges: ["Chef's Pick"],
  },
  // Sides
  {
    id: 'item_101',
    name: 'French Fries',
    nameEn: 'French Fries',
    description: 'Crispy golden fries with sea salt',
    descriptionEn: 'Crispy golden fries with sea salt',
    price: 4.50,
    status: 'available',
    isChefRecommendation: false,
    popularityScore: 85,
    categoryId: 'cat_sides',
    primaryImageUrl: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400&q=80',
    hasModifiers: false,
    badges: [],
  },
  {
    id: 'item_102',
    name: 'Onion Rings',
    nameEn: 'Onion Rings',
    description: 'Beer-battered onion rings',
    descriptionEn: 'Beer-battered onion rings',
    price: 5.50,
    status: 'available',
    isChefRecommendation: false,
    popularityScore: 72,
    categoryId: 'cat_sides',
    primaryImageUrl: 'https://images.unsplash.com/photo-1639024471283-03518883512d?w=400&q=80',
    hasModifiers: false,
    badges: [],
  },
  // Drinks
  {
    id: 'item_201',
    name: 'Coca-Cola',
    nameEn: 'Coca-Cola',
    price: 3.00,
    status: 'available',
    isChefRecommendation: false,
    popularityScore: 60,
    categoryId: 'cat_drinks',
    primaryImageUrl: 'https://images.unsplash.com/photo-1554866585-cd94860890b7?w=400&q=80',
    hasModifiers: false,
    badges: [],
  },
  {
    id: 'item_202',
    name: 'Milkshake',
    nameEn: 'Milkshake',
    description: 'Vanilla, Chocolate, or Strawberry',
    descriptionEn: 'Vanilla, Chocolate, or Strawberry',
    price: 6.50,
    status: 'available',
    isChefRecommendation: false,
    popularityScore: 68,
    categoryId: 'cat_drinks',
    primaryImageUrl: 'https://images.unsplash.com/photo-1579954115545-a95591f28bfc?w=400&q=80',
    hasModifiers: true,
    badges: [],
  },
];

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const tenantSlug = searchParams.get('tenantSlug');
  const categoryId = searchParams.get('categoryId');
  const query = searchParams.get('q')?.toLowerCase();

  // Validate tenant
  if (!tenantSlug) {
    return NextResponse.json(
      { error: 'Missing tenantSlug parameter' },
      { status: 400 }
    );
  }

  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 200));

  // Filter items
  let filteredItems = [...MOCK_ITEMS];

  // Filter by category
  if (categoryId) {
    filteredItems = filteredItems.filter((item) => item.categoryId === categoryId);
  }

  // Filter by search query
  if (query) {
    filteredItems = filteredItems.filter((item) => {
      const nameMatch = item.name.toLowerCase().includes(query);
      const nameEnMatch = item.nameEn?.toLowerCase().includes(query);
      const descMatch = item.description?.toLowerCase().includes(query);
      return nameMatch || nameEnMatch || descMatch;
    });
  }

  // Sort: chef recommendations first, then by popularity
  filteredItems.sort((a, b) => {
    if (a.isChefRecommendation !== b.isChefRecommendation) {
      return a.isChefRecommendation ? -1 : 1;
    }
    return b.popularityScore - a.popularityScore;
  });

  const response: MenuListDTO = {
    categories: MOCK_CATEGORIES,
    items: filteredItems,
  };

  return NextResponse.json(response);
}
