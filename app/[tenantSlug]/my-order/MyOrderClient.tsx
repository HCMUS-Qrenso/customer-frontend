"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Receipt, Wifi, WifiOff, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { LanguageProvider, useLanguage } from "@/lib/i18n/context";
import { useQrToken } from "@/hooks/use-qr-token";
import { useOrderSocket } from "@/hooks/use-order-socket";
import { orderApi, type OrderResponse } from "@/lib/api/order";
import { decodeQrToken } from "@/lib/utils/jwt-decode";
import { groupItemsIntoBatches } from "@/lib/utils/group-items";
import { useTenantSettings } from "@/providers/tenant-settings-context";
import type { OrderDTO, OrderStatus } from "@/lib/types/order";
import type { OrderBatch, OrderItemStatus } from "@/lib/types/order-tracking";
import { OrderStatusStepper } from "@/components/track/OrderStatusStepper";
import { BatchItemsList } from "@/components/track/BatchItemsList";
import { OrderSummaryCard } from "@/components/order/OrderSummaryCard";
import { OrderReviewSection } from "@/components/order/OrderReviewSection";
import { PageHeader } from "@/components/shared/PageHeader";
import { MobileStickyBar } from "@/components/shared/MobileStickyBar";
import { UserAvatar } from "@/components/auth/UserAvatar";

interface MyOrderClientProps {
  tenantSlug: string;
  tableId?: string;
  token?: string;
  orderId?: string; // For viewing order from history
}

/**
 * Transform API response to frontend OrderDTO format
 * serviceChargeCalculator is passed in to use dynamic rate from tenant settings
 */
function transformOrderResponse(
  data: OrderResponse["data"],
  serviceChargeCalculator: (subtotal: number) => number,
): OrderDTO | null {
  if (!data) return null;

  return {
    id: data.id,
    orderNumber: data.orderNumber,
    status: data.status as OrderStatus,
    paymentStatus: data.paymentStatus as "paid" | "unpaid",
    items: data.items.map((item) => ({
      id: item.id,
      name: item.menuItem.name,
      price: item.subtotal,
      quantity: item.quantity,
      image: item.menuItem.image,
      modifiers: item.modifiers?.map((m) => m.name).join(", "),
      note: item.specialInstructions,
      status: item.status as OrderStatus,
      addedAt: item.createdAt || new Date().toISOString(),
    })),
    subtotal: data.subtotal,
    serviceCharge: serviceChargeCalculator(data.subtotal),
    tax: data.taxAmount,
    discount: data.discountAmount > 0 ? data.discountAmount : undefined,
    voucherCode: data.voucherCode || data.voucher?.code,
    total: data.totalAmount,
    createdAt: data.createdAt,
  };
}

function MyOrderContent({
  tenantSlug,
  tableId,
  token,
  orderId,
}: MyOrderClientProps) {
  const router = useRouter();
  const { t } = useLanguage();
  const { calculateServiceCharge, formatTime } = useTenantSettings();

  // State
  const [order, setOrder] = useState<OrderDTO | null>(null);
  const [batches, setBatches] = useState<OrderBatch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [copied, setCopied] = useState(false);

  // Store QR token and table ID (only if not viewing from history)
  useQrToken(orderId ? undefined : token, orderId ? undefined : tableId);

  // Decode token to get table number
  const tableNumber = useMemo(() => {
    if (!token) return null;
    const payload = decodeQrToken(token);
    return payload?.tableNumber || null;
  }, [token]);

  // URLs (no need to include table/token params - they're in storage)
  const menuHref = `/${tenantSlug}/menu`;
  const billHref = `/${tenantSlug}/bill`;
  const ordersHistoryHref = `/${tenantSlug}/order-history`;
  const backHref = orderId ? ordersHistoryHref : menuHref;

  // Subtitle for header
  const headerSubtitle = tableNumber
    ? `${tenantSlug} · ${t.checkout?.table || "Table"} ${tableNumber}`
    : tenantSlug;

  // Copy order number
  const copyOrderNumber = () => {
    if (order?.orderNumber) {
      navigator.clipboard.writeText(order.orderNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Fetch order data
  const fetchOrder = useCallback(async () => {
    try {
      setError(null);
      // If orderId is provided, fetch specific order from history
      // Otherwise, fetch current order from session
      const result = orderId
        ? await orderApi.getMyOrderById(orderId)
        : await orderApi.getMyOrder();

      if (result.success && result.data) {
        const transformedOrder = transformOrderResponse(
          result.data,
          calculateServiceCharge,
        );
        setOrder(transformedOrder);
        const itemBatches = groupItemsIntoBatches(result.data.items);
        setBatches(itemBatches);
        setLastUpdated(new Date());
      } else {
        setOrder(null);
        setBatches([]);
      }
    } catch (err: any) {
      console.error("[MyOrder] Fetch error:", err);

      if (err.statusCode === 403 || err.message?.includes("Forbidden")) {
        setError(t.errors?.sessionExpired || "Session expired. Please scan QR code again.");
      } else if (err.statusCode === 404) {
        setOrder(null);
        setBatches([]);
      } else {
        setError(err.message || t.common?.error || "Cannot load order");
      }
    } finally {
      setIsLoading(false);
    }
  }, [orderId]);

  // Initial fetch
  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  // WebSocket for real-time updates (only for active orders, not history)
  const { isConnected } = useOrderSocket(orderId ? null : order?.id || null, {
    onOrderUpdated: (data) => {
      console.log("[MyOrder] Order updated:", data);
      if (data.id === order?.id) {
        const prevPaymentStatus = order?.paymentStatus;
        const newPaymentStatus = (data as any).paymentStatus;

        // Check if payment just completed
        if (prevPaymentStatus === "unpaid" && newPaymentStatus === "paid") {
          toast.success(
            t.myOrder?.paymentSuccess || "Payment successful! You can rate your order now.",
            {
              duration: 5000,
            },
          );
        }

        // Update order with new status and payment status
        setOrder((prev) =>
          prev
            ? {
                ...prev,
                status: data.status as OrderStatus,
                paymentStatus: newPaymentStatus || prev.paymentStatus,
              }
            : prev,
        );
        setLastUpdated(new Date());
      }
    },
    onItemStatusChanged: (data) => {
      console.log("[MyOrder] Item status changed:", data);
      if (data.orderId === order?.id) {
        setBatches((prev) =>
          prev.map((batch) => ({
            ...batch,
            items: batch.items.map((item) =>
              item.id === data.itemId
                ? { ...item, status: data.status as OrderItemStatus }
                : item,
            ),
          })),
        );
        setLastUpdated(new Date());
      }
    },
    onPaymentUpdated: (data) => {
      console.log("[MyOrder] Payment updated:", data);
      if (data.orderId === order?.id) {
        const prevPaymentStatus = order?.paymentStatus;

        // Map payment status to order payment status
        // "completed" or "paid" payment status -> "paid" order payment status
        const newPaymentStatus =
          data.status === "completed" || data.status === "paid"
            ? "paid"
            : "unpaid";

        // Check if payment just completed
        if (prevPaymentStatus === "unpaid" && newPaymentStatus === "paid") {
          toast.success(
            t.myOrder?.paymentSuccess || "Payment successful! You can rate your order now.",
            {
              duration: 5000,
            },
          );
        }

        // Update order payment status
        setOrder((prev) =>
          prev
            ? {
                ...prev,
                paymentStatus: newPaymentStatus,
              }
            : prev,
        );
        setLastUpdated(new Date());
      }
    },
  });

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 text-slate-900 dark:text-white">
        <PageHeader
          title={t.order.title}
          subtitle={headerSubtitle}
          backHref={backHref}
          maxWidth="full"
        />
        <main className="px-4 py-6 max-w-[1400px] mx-auto space-y-4">
          <Skeleton className="h-24 w-full rounded-xl" />
          <Skeleton className="h-48 w-full rounded-xl" />
          <Skeleton className="h-32 w-full rounded-xl" />
        </main>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 text-slate-900 dark:text-white">
        <PageHeader
          title={t.order.title}
          subtitle={headerSubtitle}
          backHref={backHref}
          maxWidth="full"
        />
        <main className="flex-1 flex flex-col items-center justify-center py-16 px-6">
          <div className="text-center">
            <p className="text-red-500 mb-4">{error}</p>
            <Button onClick={fetchOrder} variant="outline">
              {t.common?.retry || "Try again"}
            </Button>
          </div>
        </main>
      </div>
    );
  }

  // No order state
  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 text-slate-900 dark:text-white">
        <PageHeader
          title={t.order.title}
          subtitle={headerSubtitle}
          backHref={backHref}
          maxWidth="full"
        />
        <main className="flex-1 flex flex-col items-center justify-center py-16 px-6">
          <div className="mb-4 flex size-20 items-center justify-center rounded-full bg-gray-100 dark:bg-slate-800">
            <Receipt className="size-10 text-slate-400 dark:text-slate-500" />
          </div>
          <h3 className="mb-2 text-xl font-bold">{t.order?.noOrder || "No order yet"}</h3>
          <p className="mb-8 text-sm text-slate-500 dark:text-slate-400 text-center max-w-xs">
            {t.order?.noOrderDesc || "You haven't ordered anything. Choose from the menu!"}
          </p>
          <Link href={menuHref}>
            <Button className="bg-emerald-500 text-white hover:bg-emerald-600">
              {t.menu?.viewMenu || "View Menu"}
            </Button>
          </Link>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 text-slate-900 dark:text-white">
      {/* Header */}
      <PageHeader
        title={t.order.title}
        subtitle={headerSubtitle}
        backHref={backHref}
        maxWidth="full"
        rightContent={
          <div className="flex items-center gap-3">
            {!orderId && (
              <div className="flex items-center gap-1.5 text-xs">
                {isConnected ? (
                  <>
                    <Wifi className="size-3.5 text-emerald-500" />
                    <span className="text-emerald-500">Live</span>
                  </>
                ) : (
                  <>
                    <WifiOff className="size-3.5 text-slate-400" />
                    <span className="text-slate-400">Offline</span>
                  </>
                )}
              </div>
            )}
            <UserAvatar />
          </div>
        }
      />

      {/* Main Content - Responsive: single column on mobile, 2 columns on laptop */}
      <main className="px-4 py-4 pb-32 lg:pb-8 max-w-[1400px] mx-auto">
        {/* Order Info Bar */}
        <div className="flex items-center justify-between text-sm mb-6">
          <button
            onClick={copyOrderNumber}
            className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
          >
            <span className="font-mono text-xs">{order.orderNumber}</span>
            {copied ? (
              <Check className="size-3.5 text-emerald-500" />
            ) : (
              <Copy className="size-3.5" />
            )}
          </button>
          <span className="text-xs text-slate-400">
            {t.myOrder?.updatedAt || "Updated"} {formatTime(lastUpdated.toISOString())}
          </span>
        </div>

        {/* Grid layout: single column mobile, 2 columns laptop */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Status + Items */}
          <div className="lg:col-span-7 xl:col-span-8 space-y-6">
            {/* Items List */}
            {batches.length > 0 && <BatchItemsList batches={batches} />}
          </div>

          {/* Right: Summary - Sticky on desktop */}
          <div className="lg:col-span-5 xl:col-span-4">
            <div className="lg:sticky lg:top-24 space-y-6">
              <OrderSummaryCard order={order} />

              {/* Review Section - Show for history orders or when payment is complete */}
              {order.paymentStatus === "paid" && (
                <OrderReviewSection orderId={orderId || order.id} />
              )}

              {/* Alert that staff is processing payment request */}
              {order.status === "completed" &&
                order.paymentStatus !== "paid" && (
                  <div className="bg-emerald-50 relative dark:bg-emerald-900/30 rounded-xl p-4 mb-6 text-emerald-700 dark:text-emerald-400">
                    {t.order.paymentRequested}
                  </div>
                )}

              {/* Request Bill Button - Desktop only, for served orders */}
              {!orderId &&
                order.paymentStatus !== "paid" &&
                order.status === "served" && (
                  <div className="hidden lg:block">
                    <div className="bg-white dark:bg-slate-800 rounded-xl p-4">
                      <Link href={billHref}>
                        <Button className="w-full h-12 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-lg flex items-center justify-center gap-2">
                          <Receipt className="size-5" />
                          {t.order.requestBill}
                        </Button>
                      </Link>
                    </div>
                  </div>
                )}
            </div>
          </div>
        </div>
      </main>

      {/* Sticky CTA - Only show for served orders */}
      {!orderId &&
        order.paymentStatus !== "paid" &&
        order.status === "served" && (
          <MobileStickyBar>
            <Link href={billHref} className="w-full">
              <Button className="w-full h-12 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-full flex items-center justify-center gap-2">
                <Receipt className="size-5" />
                {t.order.requestBill}
              </Button>
            </Link>
          </MobileStickyBar>
        )}
    </div>
  );
}

export function MyOrderClient(props: MyOrderClientProps) {
  return (
    <LanguageProvider>
      <MyOrderContent {...props} />
    </LanguageProvider>
  );
}
