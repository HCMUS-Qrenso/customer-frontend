import { Metadata } from "next/dist/lib/metadata/types/metadata-interface";
import { OrderHistoryClient } from "./OrderHistoryClient";

interface OrderHistoryPageProps {
  params: Promise<{ tenantSlug: string }>;
}

export async function generateMetadata({
  params,
}: OrderHistoryPageProps): Promise<Metadata> {
  const { tenantSlug } = await params;

  return {
    title: `Order History | ${tenantSlug}`,
    description: "Manage your order history",
  };
}

export default async function OrderHistoryPage({
  params,
}: OrderHistoryPageProps) {
  const { tenantSlug } = await params;

  return <OrderHistoryClient tenantSlug={tenantSlug} />;
}
