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
 * Builds a URL with customer context params
 * Falls back to sessionStorage values if ctx params are undefined
 */
export function customerHref(
  tenantSlug: string,
  path: "menu" | "cart" | "item",
  ctx?: CustomerHrefCtx,
  itemId?: string,
): string {
  const base = `/${tenantSlug}`;
  
  // Use ctx values or fallback to sessionStorage
  const table = ctx?.table || getTableId() || "";
  const token = ctx?.token || getQrToken() || "";
  
  // Only add params if we have valid values
  const params = table && token ? `?table=${table}&token=${token}` : "";

  switch (path) {
    case "menu":
      return `${base}/menu${params}`;
    case "cart":
      return `${base}/cart${params}`;
    case "item":
      return itemId
        ? `${base}/menu/${itemId}${params}`
        : `${base}/menu${params}`;
    default:
      return `${base}${params}`;
  }
}
