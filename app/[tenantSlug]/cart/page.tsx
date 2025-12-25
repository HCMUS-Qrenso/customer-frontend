import { CartClient } from "./CartClient";

interface CartPageProps {
  params: Promise<{ tenantSlug: string }>;
  searchParams: Promise<{ table?: string; token?: string }>;
}

export default async function CartPage({
  params,
  searchParams,
}: CartPageProps) {
  const { tenantSlug } = await params;
  const { table, token } = await searchParams;

  return <CartClient tenantSlug={tenantSlug} tableId={table} token={token} />;
}
