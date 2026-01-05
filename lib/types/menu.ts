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

export type ModifierGroupType = "single_choice" | "multiple_choice";

export interface ModifierDTO {
  id: string;
  name: string;
  price_adjustment: string; // API returns string like "-10000", "0", "15000"
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

export type MenuItemStatus = "available" | "unavailable" | "sold_out";

export interface MenuItemCategoryDTO {
  id: string;
  name: string;
}

// Image object from API response
export interface MenuItemImageDTO {
  id: string;
  image_url: string;
  display_order: number;
  is_primary: boolean;
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
  images: MenuItemImageDTO[];
  modifier_groups?: { id: string; is_required: boolean }[];
  created_at: string;
  updated_at: string;
  // Display fields
  isChefRecommendation?: boolean;
  badges?: string[];
}

// Nutritional info from API
export interface NutritionalInfoDTO {
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
}

// Menu item detail (GET /menu/:id) - includes modifier_groups
export interface MenuItemDetailDTO extends MenuItemDTO {
  modifier_groups?: ModifierGroupDTO[];
  preparation_time?: number; // in minutes
  nutritional_info?: NutritionalInfoDTO;
  popularity_score?: number; // 0-100
  allergen_info?: string; // free text allergen info
  order_count?: number;
  review_count?: number;
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
  menuItemNameEn?: string;
  quantity: number;
  basePrice: number;
  image?: string;
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
  sort_by?: "createdAt" | "name" | "basePrice" | "popularityScore";
  sort_order?: "asc" | "desc";
}

// ============================================
// Customer Context
// ============================================

export type Language = "vi" | "en";

export interface CustomerContext {
  tenantSlug: string;
  tableId: string;
  token: string;
}

export type CustomerContextError =
  | "missing_params"
  | "invalid_table"
  | "inactive";
