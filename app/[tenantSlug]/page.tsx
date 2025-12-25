import { Metadata } from "next";
import { TableLandingClient } from "./TableLandingClient";

interface PageProps {
  params: Promise<{
    tenantSlug: string;
  }>;
  searchParams: Promise<{
    table?: string;
    token?: string;
  }>;
}

export async function generateMetadata({
  params,
  searchParams,
}: PageProps): Promise<Metadata> {
  const { tenantSlug } = await params;
  const { table } = await searchParams;

  // In production, fetch tenant name for better SEO
  return {
    title: `${tenantSlug} | Qrenso`,
    description: `Scan to order at table ${table || "your table"}`,
    openGraph: {
      title: `${tenantSlug} - Restaurant Ordering`,
      description:
        "Scan QR code to view menu and order directly from your table",
    },
    robots: {
      index: false, // Don't index individual table pages
      follow: false,
    },
  };
}

export default async function TableLandingPage({
  params,
  searchParams,
}: PageProps) {
  const { tenantSlug } = await params;
  const { table, token } = await searchParams;

  return (
    <TableLandingClient tenantSlug={tenantSlug} tableId={table} token={token} />
  );
}
