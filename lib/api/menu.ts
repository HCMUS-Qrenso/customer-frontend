import { apiClient } from "./client";
import type {
  MenuItemDTO,
  MenuItemDetailDTO,
  MenuListResponseDTO,
  MenuItemDetailResponseDTO,
  GetMenuParams,
  CategoryDTO,
} from "@/lib/types/menu";

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
    const { data } = await apiClient.get<MenuListResponseDTO>("/menu", {
      params: {
        page: params.page || 1,
        limit: params.limit || 20,
        search: params.search,
        category_id: params.category_id,
        status: params.status || "available",
        is_chef_recommendation: params.is_chef_recommendation,
        sort_by: params.sort_by || "popularityScore",
        sort_order: params.sort_order || "desc",
      },
    });
    return data;
  },

  /**
   * Get all categories
   * GET /categories
   */
  getCategories: async (): Promise<CategoryDTO[]> => {
    const { data } = await apiClient.get<ApiResponse<CategoriesResponse>>(
      "/categories",
      {
        params: {
          limit: 50,
          status: "active",
        },
      },
    );
    return data.data.categories;
  },

  /**
   * Get a single menu item by ID with full details including modifiers
   * GET /menu/:id
   */
  getMenuItem: async (id: string): Promise<MenuItemDetailDTO> => {
    const { data } = await apiClient.get<MenuItemDetailResponseDTO>(
      `/menu/${id}`,
    );
    return data.data;
  },
};
