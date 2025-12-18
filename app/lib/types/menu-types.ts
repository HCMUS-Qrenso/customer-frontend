// Menu Page - Type Definitions

// ============================================
// Category DTOs
// ============================================

export interface CategoryDTO {
  id: string;
  name: string;
  nameEn?: string;
  displayOrder: number;
}

// ============================================
// Menu Item DTOs
// ============================================

export type MenuItemStatus = 'available' | 'sold_out';

export interface MenuItemDTO {
  id: string;
  name: string;
  nameEn?: string;
  description?: string;
  descriptionEn?: string;
  price: number;
  status: MenuItemStatus;
  isChefRecommendation: boolean;
  popularityScore: number;
  categoryId: string;
  primaryImageUrl: string;
  hasModifiers: boolean;
  badges?: string[];
}

// ============================================
// Menu List DTO
// ============================================

export interface MenuListDTO {
  categories: CategoryDTO[];
  items: MenuItemDTO[];
}

// ============================================
// Cart Summary DTO
// ============================================

export interface CartSummaryDTO {
  count: number;
  subtotal: number;
}

// ============================================
// Session Context DTO (for menu page)
// ============================================

export interface MenuSessionContextDTO {
  tenant: {
    id: string;
    name: string;
    settings?: {
      currency?: string;
    };
  };
  table: {
    tableNumber: string;
  };
  cartSummary?: CartSummaryDTO;
}
