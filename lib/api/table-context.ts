import { apiClient } from './client'
import type { TableContextDTO } from '@/lib/types/table'

export interface GetTableContextParams {
  tenantSlug: string
  tableCode: string
}

export const tableContextApi = {
  /**
   * Get table context by tenant slug and table code
   * This is used on the landing page to show table information
   */
  getTableContext: async ({ tenantSlug, tableCode }: GetTableContextParams): Promise<TableContextDTO> => {
    const { data } = await apiClient.get<TableContextDTO>('/tables/context', {
      params: {
        tenant_slug: tenantSlug,
        table_code: tableCode,
      },
    })
    return data
  },
}

