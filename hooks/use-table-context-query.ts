import { useQuery } from '@tanstack/react-query'
import { tableContextApi, type GetTableContextParams } from '@/lib/api/table-context'
import type { TableContextDTO as LegacyTableContextDTO } from '@/lib/types/table'
import type { TableContextDTO } from '@/lib/types/table-context'

// Query keys factory
export const tableContextQueryKeys = {
  all: ['table-context'] as const,
  detail: (tenantSlug: string, tableCode: string) =>
    [...tableContextQueryKeys.all, tenantSlug, tableCode] as const,
  verifyToken: (token: string) =>
    [...tableContextQueryKeys.all, 'verify', token] as const,
}

interface UseTableContextQueryOptions {
  enabled?: boolean
}

/**
 * Hook to verify QR token and get table context
 * Uses x-qr-token header for authentication
 * This is the primary hook for table landing page
 */
export function useVerifyTokenQuery(
  token: string | undefined,
  options: UseTableContextQueryOptions = {}
) {
  const { enabled = true } = options

  return useQuery<TableContextDTO>({
    queryKey: tableContextQueryKeys.verifyToken(token || ''),
    queryFn: () => tableContextApi.verifyToken(token!),
    enabled: enabled && Boolean(token),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1, // Only retry once for token verification
  })
}

/**
 * Hook to fetch table context (tenant and table info)
 * Used on the landing page when customer scans QR code
 * @deprecated Use useVerifyTokenQuery instead
 */
export function useTableContextQuery(
  params: GetTableContextParams,
  options: UseTableContextQueryOptions = {}
) {
  const { enabled = true } = options

  return useQuery<LegacyTableContextDTO>({
    queryKey: tableContextQueryKeys.detail(params.tenantSlug, params.tableCode),
    queryFn: () => tableContextApi.getTableContext(params),
    enabled: enabled && Boolean(params.tenantSlug) && Boolean(params.tableCode),
    staleTime: 30 * 1000, // 30 seconds
  })
}
