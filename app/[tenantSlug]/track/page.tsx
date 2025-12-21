import { OrderTrackingClient } from './OrderTrackingClient';

interface TrackPageProps {
  params: Promise<{ tenantSlug: string }>;
  searchParams: Promise<{ table?: string; token?: string }>;
}

export default async function TrackPage({ params, searchParams }: TrackPageProps) {
  const { tenantSlug } = await params;
  const { table, token } = await searchParams;

  return <OrderTrackingClient tenantSlug={tenantSlug} tableId={table} token={token} />;
}
