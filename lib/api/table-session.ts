import { apiClient } from './client'
import type { StartSessionRequest, StartSessionResponse } from '@/lib/types/table'

export const tableSessionApi = {
  /**
   * Start a new table session
   * Called when customer clicks "Start Ordering" button
   */
  startSession: async (payload: StartSessionRequest): Promise<StartSessionResponse> => {
    const { data } = await apiClient.post<StartSessionResponse>('/tables/session/start', {
      tenant_slug: payload.tenantSlug,
      table_code: payload.tableCode,
      preferred_language: payload.preferredLanguage,
      party_size: payload.partySize,
    })
    return data
  },

  /**
   * Get session details by session token
   * Can be used to validate existing session
   */
  getSession: async (sessionToken: string): Promise<{ valid: boolean; expiresAt?: string }> => {
    const { data } = await apiClient.get(`/tables/session/${sessionToken}`)
    return data
  },
}

