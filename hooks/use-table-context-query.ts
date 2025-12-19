import { useQuery } from '@tanstack/react-query'
import { tableContextApi, type GetTableContextParams } from '@/lib/api/table-context'
import type { TableContextDTO } from '@/lib/types/table'

// Query keys factory
export const tableContextQueryKeys = {
  all: ['table-context'] as const,
  detail: (tenantSlug: string, tableCode: string) =>
    [...tableContextQueryKeys.all, tenantSlug, tableCode] as const,
}

interface UseTableContextQueryOptions {
  enabled?: boolean
}

/**
 * Hook to fetch table context (tenant and table info)
 * Used on the landing page when customer scans QR code
 */
export function useTableContextQuery(
  params: GetTableContextParams,
  options: UseTableContextQueryOptions = {}
) {
  const { enabled = true } = options

  return useQuery<TableContextDTO>({
    queryKey: tableContextQueryKeys.detail(params.tenantSlug, params.tableCode),
    queryFn: () => tableContextApi.getTableContext(params),
    enabled: enabled && Boolean(params.tenantSlug) && Boolean(params.tableCode),
    staleTime: 30 * 1000, // 30 seconds
  })
}

