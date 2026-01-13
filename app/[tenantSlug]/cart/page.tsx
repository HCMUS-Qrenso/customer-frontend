import { Metadata } from "next/dist/lib/metadata/types/metadata-interface";
import { CartClient } from "./CartClient";

interface CartPageProps {
  params: Promise<{ tenantSlug: string }>;
  searchParams: Promise<{ table?: string; token?: string }>;
}

export async function generateMetadata({
  params,
}: CartPageProps): Promise<Metadata> {
  const { tenantSlug } = await params;

  return {
    title: `Cart | ${tenantSlug}`,
    description: "View and manage your shopping cart",
  };
}

export default async function CartPage({
  params,
  searchParams,
}: CartPageProps) {
  const { tenantSlug } = await params;
  const { table, token } = await searchParams;

  return <CartClient tenantSlug={tenantSlug} tableId={table} token={token} />;
}
