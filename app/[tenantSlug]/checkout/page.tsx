import { CheckoutClient } from './CheckoutClient';

interface CheckoutPageProps {
  params: Promise<{ tenantSlug: string }>;
  searchParams: Promise<{ table?: string; token?: string }>;
}

export default async function CheckoutPage({ params, searchParams }: CheckoutPageProps) {
  const { tenantSlug } = await params;
  const { table, token } = await searchParams;

  return <CheckoutClient tenantSlug={tenantSlug} tableId={table} token={token} />;
}
