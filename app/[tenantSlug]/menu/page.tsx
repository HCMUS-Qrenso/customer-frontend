import { Metadata } from 'next';
import { MenuClient } from './MenuClient';

interface MenuPageProps {
  params: Promise<{
    tenantSlug: string;
  }>;
  searchParams: Promise<{
    table?: string;
    token?: string;
  }>;
}

export async function generateMetadata({ params }: MenuPageProps): Promise<Metadata> {
  const { tenantSlug } = await params;
  
  return {
    title: `Menu | ${tenantSlug}`,
    description: 'Browse our menu and order directly from your table',
  };
}

export default async function MenuPage({ params, searchParams }: MenuPageProps) {
  const { tenantSlug } = await params;
  const { table, token } = await searchParams;

  return (
    <MenuClient
      tenantSlug={tenantSlug}
      tableId={table}
      token={token}
    />
  );
}
