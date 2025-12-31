"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Receipt, UtensilsCrossed, RefreshCw, Wifi, WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LanguageProvider, useLanguage } from "@/lib/i18n/context";
import { formatTime } from "@/lib/format";
import { useQrToken } from "@/hooks/use-qr-token";
import { useOrderSocket } from "@/hooks/use-order-socket";
import { orderApi, type OrderResponse } from "@/lib/api/order";
import type { OrderDTO, OrderItemDTO, OrderStatus } from "@/lib/types/order";
import { OrderItemGroupList } from "@/components/order/OrderItemGroupList";
import { OrderSummaryCard } from "@/components/order/OrderSummaryCard";
import { PageHeader } from "@/components/shared/PageHeader";
import { MobileStickyBar } from "@/components/shared/MobileStickyBar";
import { OrderStatusCard } from "@/components/shared/OrderStatusCard";
import { Skeleton } from "@/components/ui/skeleton";

interface OrderClientProps {
  tenantSlug: string;
  tableId?: string;
  token?: string;
}

/**
 * Transform API response to frontend OrderDTO format
 */
function transformOrderResponse(data: OrderResponse['data']): OrderDTO | null {
  if (!data) return null;
  
  return {
    id: data.id,
    orderNumber: data.orderNumber,
    tableId: data.table?.id || '',
    status: data.status as OrderStatus,
    items: data.items.map((item) => ({
      id: item.id,
      name: item.menuItem.name,
      nameEn: item.menuItem.name, // TODO: add multi-lang support
      price: item.subtotal,
      quantity: item.quantity,
      image: item.menuItem.image,
      modifiers: item.modifiers?.map(m => m.name).join(', '),
      note: item.specialInstructions,
      status: item.status as OrderStatus,
      addedAt: new Date().toISOString(), // TODO: get from API
    })),
    subtotal: data.subtotal,
    serviceCharge: Math.round(data.subtotal * 0.05), // 5% service charge
    tax: data.taxAmount,
    discount: data.discountAmount,
    total: data.totalAmount,
    createdAt: data.createdAt,
  };
}

function OrderContent({ tenantSlug, tableId, token }: OrderClientProps) {
  const router = useRouter();
  const { t } = useLanguage();
  
  // State
  const [order, setOrder] = useState<OrderDTO | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // Store QR token and table ID
  useQrToken(token, tableId);

  // URLs
  const menuHref = `/${tenantSlug}/menu?table=${tableId}&token=${token}`;
  const billHref = `/${tenantSlug}/bill?table=${tableId}&token=${token}`;

  // Fetch order data
  const fetchOrder = useCallback(async () => {
    try {
      setError(null);
      const result = await orderApi.getMyOrder();
      
      if (result.success && result.data) {
        const transformedOrder = transformOrderResponse(result.data);
        setOrder(transformedOrder);
        setLastUpdated(new Date());
      } else {
        // No active order
        setOrder(null);
      }
    } catch (err: any) {
      console.error('[Order] Fetch error:', err);
      
      // Handle Forbidden error (session expired or missing)
      if (err.statusCode === 403 || err.message?.includes('Forbidden')) {
        setError('Phiên làm việc đã hết hạn. Vui lòng quét lại mã QR hoặc quay lại menu.');
      } else if (err.statusCode === 404 || err.message?.includes('not found')) {
        // No order found - this is expected if customer hasn't ordered yet
        setOrder(null);
      } else {
        setError(err.message || 'Không thể tải thông tin đơn hàng');
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  // WebSocket for real-time updates
  const { isConnected } = useOrderSocket(order?.id || null, {
    onOrderUpdated: (data) => {
      console.log('[Order] WebSocket update:', data);
      // Update order with new data
      if (data.id === order?.id) {
        setOrder((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            status: data.status as OrderStatus,
            // Update other fields as needed
          };
        });
        setLastUpdated(new Date());
      }
    },
    onItemStatusChanged: (data) => {
      console.log('[Order] Item status changed:', data);
      // Update specific item status
      if (data.orderId === order?.id) {
        setOrder((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            items: prev.items.map((item) =>
              item.id === data.itemId
                ? { ...item, status: data.status as OrderStatus }
                : item
            ),
          };
        });
        setLastUpdated(new Date());
      }
    },
    enabled: !!order?.id,
  });

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 text-slate-900 dark:text-white transition-colors">
        <PageHeader
          title={t.order.title}
          subtitle={`${tenantSlug} • ${t.checkout.table} ${tableId}`}
          onBack={() => router.push(menuHref)}
        />
        <main className="flex-1 pb-40 lg:pb-12">
          <div className="mx-auto max-w-7xl px-4 py-6 lg:px-8">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-10">
              <div className="flex flex-col gap-6 lg:col-span-7 xl:col-span-8">
                <Skeleton className="h-24 w-full rounded-xl" />
                <Skeleton className="h-48 w-full rounded-xl" />
              </div>
              <div className="lg:col-span-5 xl:col-span-4">
                <Skeleton className="h-64 w-full rounded-xl" />
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // No order state
  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 text-slate-900 dark:text-white transition-colors">
        <PageHeader
          title={t.order.title}
          subtitle={`${tenantSlug} • ${t.checkout.table} ${tableId}`}
          onBack={() => router.push(menuHref)}
        />
        <main className="flex-1 flex flex-col items-center justify-center py-16 px-6">
          <div className="mb-4 flex size-20 items-center justify-center rounded-full bg-gray-100 dark:bg-slate-800">
            <Receipt className="size-10 text-slate-400 dark:text-slate-500" />
          </div>
          <h3 className="mb-2 text-xl font-bold">Chưa có đơn hàng</h3>
          <p className="mb-8 text-sm text-slate-500 dark:text-slate-400 max-w-xs text-center">
            Bạn chưa đặt món nào. Hãy chọn món ăn từ menu!
          </p>
          <Link href={menuHref}>
            <Button className="gap-2 bg-emerald-500 text-white hover:bg-emerald-600">
              <UtensilsCrossed className="size-4" />
              Xem Menu
            </Button>
          </Link>
        </main>
      </div>
    );
  }

  // Group items by addedAt time
  const groupedItems = order.items.reduce(
    (groups, item) => {
      const time = formatTime(item.addedAt);
      if (!groups[time]) groups[time] = [];
      groups[time].push(item);
      return groups;
    },
    {} as Record<string, OrderItemDTO[]>,
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 text-slate-900 dark:text-white transition-colors">
      <PageHeader
        title={t.order.title}
        subtitle={`${tenantSlug} • ${t.checkout.table} ${tableId}`}
        onBack={() => router.push(menuHref)}
        rightContent={
          <div className="flex items-center gap-2">
            {/* WebSocket connection indicator */}
            <div className="flex items-center gap-1.5 text-xs">
              {isConnected ? (
                <>
                  <Wifi className="size-3.5 text-emerald-500" />
                  <span className="text-emerald-500 hidden sm:inline">Live</span>
                </>
              ) : (
                <>
                  <WifiOff className="size-3.5 text-slate-400" />
                  <span className="text-slate-400 hidden sm:inline">Offline</span>
                </>
              )}
            </div>
            {/* Refresh button */}
            <button
              onClick={fetchOrder}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
            >
              <RefreshCw className="size-4" />
            </button>
          </div>
        }
      />

      {/* Error message */}
      {error && (
        <div className="mx-4 mt-4 p-3 bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 pb-40 lg:pb-12">
        <div className="mx-auto max-w-7xl px-4 py-6 lg:px-8">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-10">
            {/* Left: Order Details */}
            <div className="flex flex-col gap-6 lg:col-span-7 xl:col-span-8">
              {/* Order Status Card */}
              <OrderStatusCard
                orderLabel={t.bill.orderId}
                orderNumber={order.orderNumber}
                statusLabel={t.order.live}
                updatedAt={formatTime(lastUpdated.toISOString())}
                updatedLabel={t.bill.updated}
              />

              {/* Order Items */}
              <OrderItemGroupList groupedItems={groupedItems} />
            </div>

            {/* Right: Summary */}
            <div className="lg:col-span-5 xl:col-span-4">
              <OrderSummaryCard
                order={order}
                billHref={billHref}
                menuHref={menuHref}
              />
            </div>
          </div>
        </div>
      </main>

      {/* Mobile Sticky Action Bar */}
      <MobileStickyBar>
        <div className="flex gap-3">
          <Link href={billHref} className="flex-1">
            <Button className="w-full h-12 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-full flex items-center justify-center gap-2 shadow-sm">
              <Receipt className="size-5" />
              {t.order.requestBill}
            </Button>
          </Link>
          <Link href={menuHref}>
            <Button
              variant="outline"
              className="h-12 w-12 shrink-0 rounded-full border-gray-200 dark:border-slate-700 bg-gray-100 dark:bg-slate-800"
            >
              <UtensilsCrossed className="size-5" />
            </Button>
          </Link>
        </div>
      </MobileStickyBar>
    </div>
  );
}

export function OrderClient(props: OrderClientProps) {
  return (
    <LanguageProvider>
      <OrderContent {...props} />
    </LanguageProvider>
  );
}
