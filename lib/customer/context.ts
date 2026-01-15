import type { CustomerContext, CustomerContextError } from "@/lib/types/menu";
import { getTableId, getQrToken } from "@/lib/stores/qr-token-store";

interface GetCustomerContextParams {
  tenantSlug: string;
}

interface GetCustomerContextSearchParams {
  table?: string;
  token?: string;
}

type CustomerContextResult =
  | { success: true; data: CustomerContext }
  | { success: false; error: CustomerContextError };

/**
 * Validates and extracts customer context from URL params
 * Falls back to sessionStorage if URL params are missing
 */
export function getCustomerContext(
  params: GetCustomerContextParams,
  searchParams: GetCustomerContextSearchParams,
): CustomerContextResult {
  const { tenantSlug } = params;

  // Try URL params first, then fallback to sessionStorage
  const table = searchParams.table || getTableId();
  const token = searchParams.token || getQrToken();

  // Check required params
  if (!table || !token) {
    return { success: false, error: "missing_params" };
  }

  // Validate table ID format (UUID)
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(table)) {
    return { success: false, error: "invalid_table" };
  }

  return {
    success: true,
    data: {
      tenantSlug,
      tableId: table,
      token,
    },
  };
}

interface CustomerHrefCtx {
  table?: string;
  token?: string;
}

/**
 * Builds a URL without customer context params
 * Table/token are stored in sessionStorage and don't need to be in URL
 * This keeps URLs clean and secure (tokens are removed from URL anyway)
 */
export function customerHref(
  tenantSlug: string,
  path: "menu" | "cart" | "item",
  _ctx?: CustomerHrefCtx, // Unused - kept for backward compatibility
  itemId?: string,
): string {
  const base = `/${tenantSlug}`;

  // No need to add table/token params - they're in storage
  // Pages will fallback to storage if URL params are missing
  switch (path) {
    case "menu":
      return `${base}/menu`;
    case "cart":
      return `${base}/cart`;
    case "item":
      return itemId ? `${base}/menu/${itemId}` : `${base}/menu`;
    default:
      return `${base}`;
  }
}
