import { Metadata } from 'next';
import { TableLandingClient } from './TableLandingClient';

interface PageProps {
  params: Promise<{
    tenantSlug: string;
    tableCode: string;
  }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { tenantSlug, tableCode } = await params;
  
  // In production, fetch tenant name for better SEO
  return {
    title: `Table ${tableCode} | Qrenso`,
    description: `Scan to order at table ${tableCode}`,
    openGraph: {
      title: `Table ${tableCode} - Restaurant Ordering`,
      description: 'Scan QR code to view menu and order directly from your table',
    },
    robots: {
      index: false, // Don't index individual table pages
      follow: false,
    },
  };
}

export default async function TableLandingPage({ params }: PageProps) {
  const { tenantSlug, tableCode } = await params;

  return <TableLandingClient tenantSlug={tenantSlug} tableCode={tableCode} />;
}
