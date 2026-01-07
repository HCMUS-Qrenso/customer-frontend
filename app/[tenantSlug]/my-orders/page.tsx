import { MyOrdersClient } from "./MyOrdersClient";

interface MyOrdersPageProps {
  params: Promise<{ tenantSlug: string }>;
}

export default async function MyOrdersPage({ params }: MyOrdersPageProps) {
  const { tenantSlug } = await params;

  return <MyOrdersClient tenantSlug={tenantSlug} />;
}
