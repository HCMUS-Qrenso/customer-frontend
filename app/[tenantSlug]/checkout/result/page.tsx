import { CheckoutResultClient } from './CheckoutResultClient';

interface CheckoutResultPageProps {
  params: Promise<{ tenantSlug: string }>;
  searchParams: Promise<{ table?: string; token?: string }>;
}

export default async function CheckoutResultPage({ params, searchParams }: CheckoutResultPageProps) {
  const { tenantSlug } = await params;
  const { table, token } = await searchParams;

  return <CheckoutResultClient tenantSlug={tenantSlug} tableId={table} token={token} />;
}
