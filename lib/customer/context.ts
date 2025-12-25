import type { CustomerContext, CustomerContextError } from "@/lib/types/menu";

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
 * Used by customer-facing pages to ensure valid session
 */
export function getCustomerContext(
  params: GetCustomerContextParams,
  searchParams: GetCustomerContextSearchParams,
): CustomerContextResult {
  const { tenantSlug } = params;
  const { table, token } = searchParams;

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

/**
 * Builds a URL with customer context params
 */
export function customerHref(
  tenantSlug: string,
  path: "menu" | "cart" | "item",
  ctx: { table: string; token: string },
  itemId?: string,
): string {
  const base = `/${tenantSlug}`;
  const params = `?table=${ctx.table}&token=${ctx.token}`;

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
