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
// Modifier DTOs (from GET /menu/:id response)
// ============================================

export type ModifierGroupType = 'single_choice' | 'multiple_choice';

export interface ModifierDTO {
  id: string;
  name: string;
  price: number;
  display_order: number;
  is_available?: boolean;
}

export interface ModifierGroupDTO {
  id: string;
  name: string;
  type: ModifierGroupType;
  is_required: boolean;
  min_selections: number;
  max_selections: number | null;
  display_order: number;
  modifiers: ModifierDTO[];
}

// ============================================
// Menu Item DTOs (from GET /menu response)
// ============================================

export type MenuItemStatus = 'available' | 'unavailable';

export interface MenuItemCategoryDTO {
  id: string;
  name: string;
}

// Menu item from list (GET /menu)
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
  // Display fields
  isChefRecommendation?: boolean;
  badges?: string[];
}

// Menu item detail (GET /menu/:id) - includes modifier_groups
export interface MenuItemDetailDTO extends MenuItemDTO {
  modifier_groups?: ModifierGroupDTO[];
  prep_time?: string;
  calories?: string;
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

export interface MenuItemDetailResponseDTO {
  success: boolean;
  data: MenuItemDetailDTO;
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

// Cart item with modifiers
export interface CartItemDTO {
  menuItemId: string;
  menuItemName: string;
  quantity: number;
  basePrice: number;
  selectedModifiers: {
    groupId: string;
    groupName: string;
    modifierId: string;
    modifierName: string;
    price: number;
  }[];
  notes?: string;
  totalPrice: number;
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
  is_chef_recommendation?: boolean;
  sort_by?: 'createdAt' | 'name' | 'basePrice' | 'popularityScore';
  sort_order?: 'asc' | 'desc';
}

// ============================================
// Customer Context
// ============================================

export type Language = 'vi' | 'en';

export interface CustomerContext {
  tenantSlug: string;
  tableId: string;
  token: string;
}

export type CustomerContextError = 'missing_params' | 'invalid_table' | 'inactive';
