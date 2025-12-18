import { Metadata } from 'next';
import { MenuClient } from './MenuClient';

interface MenuPageProps {
  params: Promise<{
    tenantSlug: string;
    tableCode: string;
  }>;
}

// Mock function to get tenant/table info (would be API call in production)
async function getTableContext(tenantSlug: string, tableCode: string) {
  // Simulate API call
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/public/table-context?tenantSlug=${tenantSlug}&tableCode=${tableCode}`,
    { cache: 'no-store' }
  );

  if (!response.ok) {
    return null;
  }

  return response.json();
}

export async function generateMetadata({ params }: MenuPageProps): Promise<Metadata> {
  const { tenantSlug, tableCode } = await params;
  
  return {
    title: `Menu | Table ${tableCode}`,
    description: 'Browse our menu and order directly from your table',
  };
}

export default async function MenuPage({ params }: MenuPageProps) {
  const { tenantSlug, tableCode } = await params;

  // For now, use mock data since we're in server component
  // In production, this would fetch from the API
  const tenantName = tenantSlug === 'demo-restaurant' ? 'The Burger Joint' : 'Restaurant';
  const tableNumber = tableCode.replace('TABLE', '');

  return (
    <MenuClient
      tenantSlug={tenantSlug}
      tableCode={tableCode}
      tenantName={tenantName}
      tableNumber={tableNumber}
    />
  );
}
