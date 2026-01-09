"use client";

import { useMemo, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CreditCard, Wallet, DollarSign, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { LanguageProvider, useLanguage } from "@/lib/i18n/context";
import { useQrToken } from "@/hooks/use-qr-token";
import { getQrToken, getTableId } from "@/lib/stores/qr-token-store";
import { decodeQrToken } from "@/lib/utils/jwt-decode";
import { PageHeader } from "@/components/shared/PageHeader";
import { MobileStickyBar } from "@/components/shared/MobileStickyBar";
import { UserAvatar } from "@/components/auth/UserAvatar";
import { useTenantSettings } from "@/providers/tenant-settings-context";
import { orderApi } from "@/lib/api/order";
import * as paymentApi from "@/lib/api/payment";
import { toast } from "sonner";

interface BillClientProps {
  tenantSlug: string;
  tableId?: string;
  token?: string;
}

function BillContent({
  tenantSlug,
  tableId: propsTableId,
  token: propsToken,
}: BillClientProps) {
  const router = useRouter();
  const { t } = useLanguage();
  const { formatPrice, formatTime } = useTenantSettings();
  const [order, setOrder] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "qr">("cash");
  const [isProcessing, setIsProcessing] = useState(false);

  // Use props or fallback to persisted values from sessionStorage
  const tableId = propsTableId || getTableId() || undefined;
  const token = propsToken || getQrToken() || undefined;

  // Store QR token and tableId
  useQrToken(token, tableId);

  // Decode token to get table number
  const tableNumber = useMemo(() => {
    if (!token) return null;
    const payload = decodeQrToken(token);
    return payload?.tableNumber || null;
  }, [token]);

  // Fetch current order
  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setIsLoading(true);
        const result = await orderApi.getMyOrder();
        if (result.success && result.data) {
          setOrder(result.data);
        } else {
          toast.error("Không tìm thấy đơn hàng");
        }
      } catch (err) {
        console.error("[Bill] Failed to fetch order:", err);
        toast.error("Không thể tải thông tin đơn hàng");
      } finally {
        setIsLoading(false);
      }
    };
    fetchOrder();
  }, []);

  // Handle payment button click
  const handlePayment = async () => {
    if (!order?.id) {
      toast.error("Không tìm thấy thông tin đơn hàng");
      return;
    }

    try {
      setIsProcessing(true);
      const result = await paymentApi.requestBill({
        orderId: order.id,
        notes:
          paymentMethod === "cash" ? "Thanh toán tiền mặt" : "Thanh toán QR",
      });

      if (result.success) {
        toast.success("Đã gửi yêu cầu thanh toán!", {
          description:
            paymentMethod === "cash"
              ? "Nhân viên sẽ mang hóa đơn đến bàn của bạn"
              : "Nhân viên sẽ hướng dẫn thanh toán QR",
          duration: 5000,
        });
        // Navigate back after 2 seconds
        setTimeout(() => {
          router.back();
        }, 2000);
      }
    } catch (err: any) {
      console.error("[Bill] Failed to request payment:", err);
      toast.error("Không thể gửi yêu cầu", {
        description: err.message || "Vui lòng thử lại",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="relative flex min-h-screen flex-col items-center justify-center bg-gray-50 dark:bg-slate-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="relative flex min-h-screen flex-col items-center justify-center bg-gray-50 dark:bg-slate-900">
        <div className="text-center">
          <p className="text-slate-600 dark:text-slate-400 mb-4">
            Không tìm thấy đơn hàng
          </p>
          <Button onClick={() => router.back()}>Quay lại</Button>
        </div>
      </div>
    );
  }

  // Check if order is completed (staff received payment request and processing)
  if (order.status === "completed") {
    return (
      <div className="relative flex min-h-screen flex-col bg-gray-50 dark:bg-slate-900 text-slate-900 dark:text-white transition-colors">
        <PageHeader
          title="Thanh toán"
          subtitle={
            tableNumber ? `${tenantSlug} • Bàn ${tableNumber}` : tenantSlug
          }
          onBack={() => router.back()}
          rightContent={<UserAvatar />}
        />
        <main className="flex-1 flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-white dark:bg-slate-800 rounded-xl p-8 text-center">
            <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="size-8 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h2 className="text-xl font-bold mb-2">
              Nhân viên đã nhận yêu cầu
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              Nhân viên đang xử lý thanh toán của bạn. Vui lòng đợi trong giây
              lát.
            </p>
            <div className="flex flex-col gap-3">
              <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-slate-600 dark:text-slate-400">
                    Đơn hàng
                  </span>
                  <span className="font-mono font-semibold">
                    {order.orderNumber}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600 dark:text-slate-400">
                    Tổng tiền
                  </span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">
                    {formatPrice(order.totalAmount)}
                  </span>
                </div>
              </div>
              <Button
                variant="outline"
                onClick={() => router.back()}
                className="w-full"
              >
                Quay lại
              </Button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen flex-col bg-gray-50 dark:bg-slate-900 text-slate-900 dark:text-white transition-colors">
      <PageHeader
        title="Thanh toán"
        subtitle={
          tableNumber ? `${tenantSlug} • Bàn ${tableNumber}` : tenantSlug
        }
        onBack={() => router.back()}
        rightContent={<UserAvatar />}
      />

      {/* Main Content */}
      <main className="flex-1 pb-32 lg:pb-12">
        <div className="mx-auto max-w-3xl px-4 py-6">
          {/* Order Summary */}
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Đơn hàng
                </p>
                <p className="font-bold text-lg">{order.orderNumber}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Bàn
                </p>
                <p className="font-bold text-lg">{order.table?.tableNumber}</p>
              </div>
            </div>

            {/* Order Items */}
            <div className="border-t border-slate-200 dark:border-slate-700 pt-4 space-y-3">
              {order.items?.map((item: any) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <div className="flex-1">
                    <p className="font-medium">{item.menuItem?.name}</p>
                    <p className="text-slate-500 dark:text-slate-400">
                      x{item.quantity}
                    </p>
                    {item.modifiers && item.modifiers.length > 0 && (
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {item.modifiers.map((m: any) => m.name).join(", ")}
                      </p>
                    )}
                  </div>
                  <p className="font-medium">{formatPrice(item.subtotal)}</p>
                </div>
              ))}
            </div>

            {/* Total */}
            <div className="border-t border-slate-200 dark:border-slate-700 mt-4 pt-4">
              <div className="flex justify-between text-sm mb-2">
                <p className="text-slate-600 dark:text-slate-400">Tạm tính</p>
                <p>{formatPrice(order.subtotal)}</p>
              </div>
              {order.taxAmount > 0 && (
                <div className="flex justify-between text-sm mb-2">
                  <p className="text-slate-600 dark:text-slate-400">VAT</p>
                  <p>{formatPrice(order.taxAmount)}</p>
                </div>
              )}
              <div className="flex justify-between text-lg font-bold mt-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                <p>Tổng cộng</p>
                <p className="text-emerald-600 dark:text-emerald-400">
                  {formatPrice(order.totalAmount)}
                </p>
              </div>
            </div>
          </div>

          {/* Payment Method Selection */}
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 mb-6">
            <h3 className="font-bold text-lg mb-4">Phương thức thanh toán</h3>
            <RadioGroup
              value={paymentMethod}
              onValueChange={(value) =>
                setPaymentMethod(value as "cash" | "qr")
              }
            >
              <div className="space-y-3">
                {/* Cash Payment */}
                <Label
                  htmlFor="cash"
                  className="flex items-center space-x-3 border-2 border-slate-200 dark:border-slate-700 rounded-lg p-4 cursor-pointer hover:border-emerald-500 dark:hover:border-emerald-500 transition-colors"
                  style={{
                    borderColor:
                      paymentMethod === "cash" ? "rgb(16 185 129)" : "",
                  }}
                >
                  <RadioGroupItem value="cash" id="cash" />
                  <div className="flex items-center gap-3 flex-1">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                      <DollarSign className="size-5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div>
                      <p className="font-medium">Tiền mặt</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        Thanh toán bằng tiền mặt với nhân viên
                      </p>
                    </div>
                  </div>
                </Label>

                {/* QR Payment */}
                <Label
                  htmlFor="qr"
                  className="flex items-center space-x-3 border-2 border-slate-200 dark:border-slate-700 rounded-lg p-4 cursor-pointer hover:border-emerald-500 dark:hover:border-emerald-500 transition-colors"
                  style={{
                    borderColor:
                      paymentMethod === "qr" ? "rgb(16 185 129)" : "",
                  }}
                >
                  <RadioGroupItem value="qr" id="qr" />
                  <div className="flex items-center gap-3 flex-1">
                    <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                      <Wallet className="size-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="font-medium">Thanh toán QR</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        Quét mã QR để thanh toán qua ví điện tử
                      </p>
                    </div>
                  </div>
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Desktop Payment Button */}
          <div className="hidden lg:block">
            <Button
              onClick={handlePayment}
              disabled={isProcessing}
              className="w-full h-12 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-full flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Đang xử lý...
                </>
              ) : (
                <>
                  <CreditCard className="size-5" />
                  Thanh toán ngay
                </>
              )}
            </Button>
          </div>
        </div>
      </main>

      {/* Sticky Payment Button */}
      <MobileStickyBar>
        <Button
          onClick={handlePayment}
          disabled={isProcessing}
          className="w-full h-12 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-full flex items-center justify-center gap-2"
        >
          {isProcessing ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              Đang xử lý...
            </>
          ) : (
            <>
              <CreditCard className="size-5" />
              Thanh toán ngay
            </>
          )}
        </Button>
      </MobileStickyBar>
    </div>
  );
}

export function BillClient(props: BillClientProps) {
  return (
    <LanguageProvider>
      <BillContent {...props} />
    </LanguageProvider>
  );
}
