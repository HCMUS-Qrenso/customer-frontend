import { Metadata } from 'next';
import { getCustomerContext } from '@/lib/customer/context';
import { InvalidSessionState } from '@/components/InvalidSessionState';
import { ItemDetailClient } from './ItemDetailClient';

interface ItemDetailPageProps {
  params: Promise<{ tenantSlug: string; itemId: string }>;
  searchParams: Promise<{ table?: string; token?: string }>;
}

export async function generateMetadata({ params }: ItemDetailPageProps): Promise<Metadata> {
  const { tenantSlug, itemId } = await params;
  
  return {
    title: `Chi tiết món | ${tenantSlug}`,
    description: 'Xem chi tiết và thêm vào giỏ hàng',
  };
}

export default async function ItemDetailPage({ params, searchParams }: ItemDetailPageProps) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;

  const ctxResult = getCustomerContext(
    { tenantSlug: resolvedParams.tenantSlug },
    resolvedSearchParams
  );

  if (!ctxResult.success) {
    return <InvalidSessionState type={ctxResult.error} />;
  }

  const { tenantSlug, tableId, token } = ctxResult.data;
  const { itemId } = resolvedParams;

  return (
    <ItemDetailClient
      tenantSlug={tenantSlug}
      itemId={itemId}
      ctx={{ table: tableId, token }}
    />
  );
}
