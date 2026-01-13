import { Metadata } from "next/dist/lib/metadata/types/metadata-interface";
import { MyOrderClient } from "./MyOrderClient";

interface MyOrderPageProps {
  params: Promise<{ tenantSlug: string }>;
  searchParams: Promise<{ table?: string; token?: string; orderId?: string }>;
}

export async function generateMetadata({
  params,
}: MyOrderPageProps): Promise<Metadata> {
  const { tenantSlug } = await params;

  return {
    title: `My Order | ${tenantSlug}`,
    description: "View and manage your order details",
  };
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
