import { apiClient } from './client'
import type { MenuItemDTO, MenuListResponseDTO, GetMenuParams, CategoryDTO } from '@/lib/types/menu'

// API response wrapper type
interface ApiResponse<T> {
  success: boolean;
  data: T;
}

interface CategoriesResponse {
  categories: CategoryDTO[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}

export const menuApi = {
  /**
   * Get menu items with pagination and filtering
   * GET /menu
   */
  getMenu: async (params: GetMenuParams = {}): Promise<MenuListResponseDTO> => {
    const { data } = await apiClient.get<MenuListResponseDTO>('/menu', {
      params: {
        page: params.page || 1,
        limit: params.limit || 20, // Default 20 items per page
        search: params.search,
        category_id: params.category_id,
        status: params.status || 'active', // Only show active items
        sort_by: params.sort_by || 'display_order',
        sort_order: params.sort_order || 'asc',
      },
    })
    return data
  },

  /**
   * Get all categories
   * GET /categories
   */
  getCategories: async (): Promise<CategoryDTO[]> => {
    const { data } = await apiClient.get<ApiResponse<CategoriesResponse>>('/categories', {
      params: {
        limit: 100, // Get all categories
        is_active: true,
      },
    })
    return data.data.categories
  },

  /**
   * Get a single menu item by ID
   * GET /menu/:id
   */
  getMenuItem: async (id: string): Promise<MenuItemDTO> => {
    const { data } = await apiClient.get<ApiResponse<{ menu_item: MenuItemDTO }>>(`/menu/${id}`)
    return data.data.menu_item
  },
}
