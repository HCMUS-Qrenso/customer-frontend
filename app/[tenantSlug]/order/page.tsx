import { OrderClient } from "./OrderClient";

interface OrderPageProps {
  params: Promise<{ tenantSlug: string }>;
  searchParams: Promise<{ table?: string; token?: string }>;
}

export default async function OrderPage({
  params,
  searchParams,
}: OrderPageProps) {
  const { tenantSlug } = await params;
  const { table, token } = await searchParams;

  return <OrderClient tenantSlug={tenantSlug} tableId={table} token={token} />;
}
