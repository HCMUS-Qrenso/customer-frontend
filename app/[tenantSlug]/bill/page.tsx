import { Metadata } from "next/dist/lib/metadata/types/metadata-interface";
import { BillClient } from "./BillClient";

interface BillPageProps {
  params: Promise<{ tenantSlug: string }>;
  searchParams: Promise<{ table?: string; token?: string }>;
}

export async function generateMetadata({
  params,
}: BillPageProps): Promise<Metadata> {
  const { tenantSlug } = await params;

  return {
    title: `Bill | ${tenantSlug}`,
    description: "Review and request your bill",
  };
}

export default async function BillPage({
  params,
  searchParams,
}: BillPageProps) {
  const { tenantSlug } = await params;
  const { table, token } = await searchParams;

  return <BillClient tenantSlug={tenantSlug} tableId={table} token={token} />;
}
