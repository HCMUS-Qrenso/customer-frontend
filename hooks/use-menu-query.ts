import { useQuery, useInfiniteQuery } from '@tanstack/react-query'
import { menuApi } from '@/lib/api/menu'
import type { MenuItemDetailDTO, CategoryDTO, GetMenuParams, MenuListResponseDTO } from '@/lib/types/menu'

// Query keys factory
export const menuQueryKeys = {
  all: ['menu'] as const,
  list: (params?: GetMenuParams) =>
    [...menuQueryKeys.all, 'list', params] as const,
  infinite: (params?: GetMenuParams) =>
    [...menuQueryKeys.all, 'infinite', params] as const,
  detail: (id: string) => [...menuQueryKeys.all, 'detail', id] as const,
  categories: () => [...menuQueryKeys.all, 'categories'] as const,
}

interface UseMenuQueryOptions {
  enabled?: boolean
}

/**
 * Hook to fetch menu items with standard pagination
 */
export function useMenuQuery(
  params: GetMenuParams = {},
  options: UseMenuQueryOptions = {}
) {
  const { enabled = true } = options

  return useQuery<MenuListResponseDTO>({
    queryKey: menuQueryKeys.list(params),
    queryFn: () => menuApi.getMenu(params),
    enabled,
    staleTime: 60 * 1000, // 1 minute
  })
}

/**
 * Hook to fetch menu items with infinite scroll pagination
 * Loads 20 items per page, loads more when user scrolls down
 */
export function useInfiniteMenuQuery(
  params: Omit<GetMenuParams, 'page'> = {},
  options: UseMenuQueryOptions = {}
) {
  const { enabled = true } = options

  return useInfiniteQuery<MenuListResponseDTO>({
    queryKey: menuQueryKeys.infinite(params),
    queryFn: async ({ pageParam = 1 }) => {
      return menuApi.getMenu({
        ...params,
        page: pageParam as number,
        limit: params.limit || 20, // Default limit 20
      })
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const { page, total_pages } = lastPage.data.pagination
      // Return next page number or undefined if no more pages
      return page < total_pages ? page + 1 : undefined
    },
    enabled,
    staleTime: 60 * 1000, // 1 minute
  })
}

/**
 * Hook to fetch categories
 */
export function useCategoriesQuery(
  options: UseMenuQueryOptions = {}
) {
  const { enabled = true } = options

  return useQuery<CategoryDTO[]>({
    queryKey: menuQueryKeys.categories(),
    queryFn: () => menuApi.getCategories(),
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes - categories change rarely
  })
}

/**
 * Hook to fetch a single menu item with full details including modifiers
 */
export function useMenuItemQuery(
  id: string | null,
  options: UseMenuQueryOptions = {}
) {
  const { enabled = true } = options

  return useQuery<MenuItemDetailDTO>({
    queryKey: menuQueryKeys.detail(id!),
    queryFn: () => menuApi.getMenuItem(id!),
    enabled: enabled && Boolean(id),
    staleTime: 60 * 1000, // 1 minute
  })
}
