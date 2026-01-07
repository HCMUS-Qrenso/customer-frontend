import { apiClient } from "./client";
import type { TableContextDTO as LegacyTableContextDTO } from "@/lib/types/table";
import type {
  TableContextDTO,
  VerifyTokenResponse,
} from "@/lib/types/table-context";

export interface GetTableContextParams {
  tenantSlug: string;
  tableCode: string;
}

export const tableContextApi = {
  /**
   * Verify QR token and get table context
   * Uses x-qr-token header (v2.0 - no backward compatibility)
   * GET /tables/qr/verify-token
   */
  verifyToken: async (token: string): Promise<TableContextDTO> => {
    const { data } = await apiClient.get<VerifyTokenResponse>(
      "/tables/qr/verify-token",
      {
        headers: { "x-qr-token": token },
      },
    );
    return data.data;
  },

  /**
   * Get table context by tenant slug and table code
   * This is used on the landing page to show table information
   * @deprecated Use verifyToken instead
   */
  getTableContext: async ({
    tenantSlug,
    tableCode,
  }: GetTableContextParams): Promise<LegacyTableContextDTO> => {
    const { data } = await apiClient.get<LegacyTableContextDTO>(
      "/tables/context",
      {
        params: {
          tenant_slug: tenantSlug,
          table_code: tableCode,
        },
      },
    );
    return data;
  },
};
