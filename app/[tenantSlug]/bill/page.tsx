import { BillClient } from "./BillClient";

interface BillPageProps {
  params: Promise<{ tenantSlug: string }>;
  searchParams: Promise<{ table?: string; token?: string }>;
}

export default async function BillPage({
  params,
  searchParams,
}: BillPageProps) {
  const { tenantSlug } = await params;
  const { table, token } = await searchParams;

  return <BillClient tenantSlug={tenantSlug} tableId={table} token={token} />;
}
