"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Package,
  Calendar,
  Search,
  Loader2,
  AlertCircle,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { LanguageProvider, useLanguage } from "@/lib/i18n/context";
import { orderApi, type OrderHistoryResponse } from "@/lib/api/order";
import { useAuth } from "@/hooks/use-auth";
import { PageHeader } from "@/components/shared/PageHeader";
import { UserAvatar } from "@/components/auth/UserAvatar";
import { OrderReviewsDisplay } from "@/components/order/OrderReviewsDisplay";
import { useTenantSettings } from "@/providers/tenant-settings-context";

interface OrderHistoryClientProps {
  tenantSlug: string;
}

function OrderHistoryContent({ tenantSlug }: OrderHistoryClientProps) {
  const { t } = useLanguage();
  const { formatPrice, formatDate } = useTenantSettings();
  const router = useRouter();
  const { isAuthenticated, isInitialized } = useAuth({
    requireAuth: true,
    loginUrl: `/auth/login`,
  });

  // Filter states
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string | undefined>();
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch order history
  const {
    data: ordersData,
    isLoading,
    error,
    refetch,
  } = useQuery<OrderHistoryResponse>({
    queryKey: ["order-history", page, statusFilter, searchQuery],
    queryFn: () =>
      orderApi.getMyOrders({
        page,
        limit: 10,
        status: statusFilter,
        search: searchQuery || undefined,
        sort_by: "createdAt",
        sort_order: "desc",
      }),
    enabled: isAuthenticated && isInitialized,
    retry: 1,
  });

  const orders = ordersData?.data || [];
  const meta = ordersData?.meta;

  // Show loading while auth initializes
  if (!isInitialized) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50 dark:bg-slate-900">
        <Loader2 className="size-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  // Get status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      case "pending":
      case "accepted":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
      case "in_progress":
      case "ready":
      case "served":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
      case "cancelled":
      case "rejected":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
    }
  };

  // Get payment status badge color
  const getPaymentStatusColor = (paymentStatus: string) => {
    switch (paymentStatus) {
      case "paid":
        return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400";
      case "unpaid":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
    }
  };

  // Format status text
  const formatStatus = (status: string) => {
    const statusMap: Record<string, string> = {
      pending: "Chờ xử lý",
      accepted: "Đã chấp nhận",
      in_progress: "Đang chuẩn bị",
      ready: "Sẵn sàng",
      served: "Đã phục vụ",
      completed: "Hoàn thành",
      cancelled: "Đã hủy",
      rejected: "Từ chối",
      abandoned: "Bỏ qua",
    };
    return statusMap[status] || status;
  };

  // Get menu href for back button
  const menuHref = `/${tenantSlug}/menu`;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <PageHeader
        title="Lịch sử đơn hàng"
        subtitle={tenantSlug}
        backHref={menuHref}
        rightContent={<UserAvatar />}
      />

      <div className="container mx-auto px-4 py-4 sm:py-6 max-w-4xl">
        {/* Filters - Fixed layout, doesn't change when filtering */}
        <div className="mb-6 space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm kiếm theo mã đơn hàng..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
              className="w-full pl-10 pr-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
            />
          </div>

          {/* Status Filter */}
          <div className="flex gap-2 flex-wrap">
            <Button
              variant={!statusFilter ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter(undefined)}
              className="text-xs sm:text-sm"
            >
              Tất cả
            </Button>
            <Button
              variant={statusFilter === "completed" ? "default" : "outline"}
              size="sm"
              onClick={() => {
                setStatusFilter("completed");
                setPage(1);
              }}
              className="text-xs sm:text-sm"
            >
              Hoàn thành
            </Button>
            <Button
              variant={statusFilter === "pending" ? "default" : "outline"}
              size="sm"
              onClick={() => {
                setStatusFilter("pending");
                setPage(1);
              }}
              className="text-xs sm:text-sm"
            >
              Chờ xử lý
            </Button>
            <Button
              variant={statusFilter === "cancelled" ? "default" : "outline"}
              size="sm"
              onClick={() => {
                setStatusFilter("cancelled");
                setPage(1);
              }}
              className="text-xs sm:text-sm"
            >
              Đã hủy
            </Button>
          </div>
        </div>

        {/* Orders List - Only this section changes when filtering */}
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-40 w-full rounded-xl" />
            ))}
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <AlertCircle className="size-12 text-red-500 mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
              Không thể tải lịch sử đơn hàng
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
              {(error as Error).message || "Đã xảy ra lỗi khi tải dữ liệu"}
            </p>
            <Button onClick={() => refetch()} variant="outline">
              Thử lại
            </Button>
          </div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Package className="size-16 text-slate-400 mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
              Chưa có đơn hàng nào
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
              Bạn chưa đặt đơn hàng nào. Hãy bắt đầu đặt món ngay!
            </p>
            <Link href={`/${tenantSlug}/menu`}>
              <Button>Xem thực đơn</Button>
            </Link>
          </div>
        ) : (
          <>
            <div className="space-y-3 sm:space-y-4">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden"
                >
                  {/* Clickable upper section - navigates to detail */}
                  <Link
                    href={`/${tenantSlug}/my-order?orderId=${order.id}`}
                    className="block group p-4 sm:p-5 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                  >
                    {/* Header: Order Number, Status, Total */}
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <h3 className="font-bold text-base sm:text-lg text-emerald-600 dark:text-emerald-400 truncate">
                            {order.orderNumber}
                          </h3>
                          <Badge className={getStatusColor(order.status)}>
                            {formatStatus(order.status)}
                          </Badge>
                          <Badge
                            className={getPaymentStatusColor(
                              order.paymentStatus,
                            )}
                          >
                            {order.paymentStatus === "paid"
                              ? "Đã thanh toán"
                              : "Chưa thanh toán"}
                          </Badge>
                        </div>
                        <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="size-3.5 sm:size-4 shrink-0" />
                            <span>{formatDate(order.createdAt)}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span>Bàn {order.table.tableNumber}</span>
                            {order.table.zone && (
                              <span className="text-slate-500">
                                · {order.table.zone.name}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between sm:flex-col sm:items-end sm:justify-start gap-2 sm:gap-1">
                        <div className="font-bold text-lg sm:text-xl text-slate-900 dark:text-white">
                          {formatPrice(order.totalAmount)}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">
                          {order.itemCount} món
                        </div>
                        <ChevronRight className="size-5 text-slate-400 group-hover:text-emerald-500 transition-colors sm:hidden" />
                      </div>
                    </div>

                    {/* Order Items Preview */}
                    <div className="pt-3 border-t border-slate-200 dark:border-slate-700">
                      <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm">
                        {order.items.slice(0, 3).map((item) => (
                          <span
                            key={item.id}
                            className="text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-700/50 px-2 py-1 rounded"
                          >
                            {item.name} x{item.quantity}
                          </span>
                        ))}
                        {order.items.length > 3 && (
                          <span className="text-slate-500 dark:text-slate-500 bg-slate-50 dark:bg-slate-700/50 px-2 py-1 rounded">
                            +{order.items.length - 3} món khác
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>

                  {/* Non-clickable review section */}
                  {order.status === "completed" && order.paymentStatus === "paid" && (
                    <div className="px-4 sm:px-5 pb-4 sm:pb-5">
                      <OrderReviewsDisplay orderId={order.id} />
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Pagination */}
            {meta && meta.totalPages > 1 && (
              <div className="mt-6 flex items-center justify-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="text-xs sm:text-sm"
                >
                  Trước
                </Button>
                <span className="text-sm text-slate-600 dark:text-slate-400 min-w-[80px] text-center">
                  Trang {page} / {meta.totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setPage((p) => Math.min(meta.totalPages, p + 1))
                  }
                  disabled={page === meta.totalPages}
                  className="text-xs sm:text-sm"
                >
                  Sau
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export function OrderHistoryClient({ tenantSlug }: OrderHistoryClientProps) {
  return (
    <LanguageProvider>
      <OrderHistoryContent tenantSlug={tenantSlug} />
    </LanguageProvider>
  );
}
