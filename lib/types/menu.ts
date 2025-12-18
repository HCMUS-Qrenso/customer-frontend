// Menu Page - Type Definitions (matching backend API response)

// ============================================
// Category DTOs
// ============================================

export interface CategoryDTO {
  id: string;
  name: string;
  description?: string;
  display_order: number;
  is_active: boolean;
}

// ============================================
// Menu Item DTOs (from GET /menu response)
// ============================================

export type MenuItemStatus = 'active' | 'inactive';

export interface MenuItemImageDTO {
  url: string;
  alt?: string;
}

export interface MenuItemCategoryDTO {
  id: string;
  name: string;
}

export interface MenuItemDTO {
  id: string;
  name: string;
  description?: string;
  base_price: number;
  status: MenuItemStatus;
  allergens?: string[];
  category: MenuItemCategoryDTO;
  images: string[];
  created_at: string;
  updated_at: string;
  // Frontend computed/display fields
  isChefRecommendation?: boolean;
  badges?: string[];
}

// ============================================
// API Response DTOs
// ============================================

export interface PaginationDTO {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
}

export interface MenuListResponseDTO {
  success: boolean;
  data: {
    menu_items: MenuItemDTO[];
    pagination: PaginationDTO;
  };
}

// ============================================
// Frontend Display DTOs
// ============================================

export interface MenuListDTO {
  categories: CategoryDTO[];
  items: MenuItemDTO[];
  pagination?: PaginationDTO;
}

// ============================================
// Cart Summary DTO
// ============================================

export interface CartSummaryDTO {
  count: number;
  subtotal: number;
}

// ============================================
// Query Params
// ============================================

export interface GetMenuParams {
  page?: number;
  limit?: number;
  search?: string;
  category_id?: string;
  status?: MenuItemStatus;
  sort_by?: 'name' | 'base_price' | 'created_at' | 'display_order';
  sort_order?: 'asc' | 'desc';
}
