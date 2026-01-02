import { Metadata } from "next";
import { ItemDetailClient } from "./ItemDetailClient";

interface ItemDetailPageProps {
  params: Promise<{ tenantSlug: string; itemId: string }>;
  searchParams: Promise<{ table?: string; token?: string }>;
}

export async function generateMetadata({
  params,
}: ItemDetailPageProps): Promise<Metadata> {
  const { tenantSlug, itemId } = await params;

  return {
    title: `Chi tiết món | ${tenantSlug}`,
    description: "Xem chi tiết và thêm vào giỏ hàng",
  };
}

export default async function ItemDetailPage({
  params,
  searchParams,
}: ItemDetailPageProps) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const { tenantSlug, itemId } = resolvedParams;
  const { table, token } = resolvedSearchParams;

  return (
    <ItemDetailClient
      tenantSlug={tenantSlug}
      itemId={itemId}
      tableId={table}
      token={token}
    />
  );
}
