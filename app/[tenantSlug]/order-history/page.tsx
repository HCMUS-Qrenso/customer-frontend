import { OrderHistoryClient } from "./OrderHistoryClient";

interface OrderHistoryPageProps {
  params: Promise<{ tenantSlug: string }>;
}

export default async function OrderHistoryPage({
  params,
}: OrderHistoryPageProps) {
  const { tenantSlug } = await params;

  return <OrderHistoryClient tenantSlug={tenantSlug} />;
}
