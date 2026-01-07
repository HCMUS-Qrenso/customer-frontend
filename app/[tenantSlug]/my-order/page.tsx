import { MyOrderClient } from "./MyOrderClient";

interface MyOrderPageProps {
  params: Promise<{ tenantSlug: string }>;
  searchParams: Promise<{ table?: string; token?: string; orderId?: string }>;
}

export default async function MyOrderPage({
  params,
  searchParams,
}: MyOrderPageProps) {
  const { tenantSlug } = await params;
  const { table, token, orderId } = await searchParams;

  return (
    <MyOrderClient
      tenantSlug={tenantSlug}
      tableId={table}
      token={token}
      orderId={orderId}
    />
  );
}
