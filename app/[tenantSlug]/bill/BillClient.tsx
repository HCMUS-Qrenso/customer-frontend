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
          toast.error(t.common?.error || "Error");
        }
      } catch (err) {
        console.error("[Bill] Failed to fetch order:", err);
        toast.error(t.common?.error || "Error");
      } finally {
        setIsLoading(false);
      }
    };
    fetchOrder();
  }, []);

  // Handle payment button click
  const handlePayment = async () => {
    if (!order?.id) {
      toast.error(t.common?.error || "Error");
      return;
    }

    try {
      setIsProcessing(true);
      const result = await paymentApi.requestBill({
        orderId: order.id,
        notes:
          paymentMethod === "cash" ? t.checkout?.cash : t.checkout?.qr,
      });

      if (result.success) {
        toast.success(t.checkout?.requestSent || "Payment request sent!", {
          description:
            paymentMethod === "cash"
              ? t.checkout?.cashDesc
              : t.checkout?.staffGuideQR,
          duration: 5000,
        });
        // Navigate back after 2 seconds
        setTimeout(() => {
          router.back();
        }, 2000);
      }
    } catch (err: any) {
      console.error("[Bill] Failed to request payment:", err);
      toast.error(t.common?.error || "Cannot send request", {
        description: err.message || "Please try again",
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
          <p className="text-slate-600 dark:text-slate-400">{t.checkout?.processing || "Loading..."}</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="relative flex min-h-screen flex-col items-center justify-center bg-gray-50 dark:bg-slate-900">
        <div className="text-center">
          <p className="text-slate-600 dark:text-slate-400 mb-4">
            {t.common?.error || "Order not found"}
          </p>
          <Button onClick={() => router.back()}>{t.common?.back || "Back"}</Button>
        </div>
      </div>
    );
  }

  // Check if order is completed (staff received payment request and processing)
  if (order.status === "completed") {
    return (
      <div className="relative flex min-h-screen flex-col bg-gray-50 dark:bg-slate-900 text-slate-900 dark:text-white transition-colors">
        <PageHeader
          title={t.checkout?.title || "Payment"}
          subtitle={
            tableNumber ? `${tenantSlug} • ${t.checkout?.table || "Table"} ${tableNumber}` : tenantSlug
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
              {t.checkout?.staffProcessing || "Staff received your request"}
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              {t.checkout?.staffProcessing || "Staff is processing your payment. Please wait."}
            </p>
            <div className="flex flex-col gap-3">
              <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-slate-600 dark:text-slate-400">
                    {t.checkout?.orderNumber || "Order"}
                  </span>
                  <span className="font-mono font-semibold">
                    {order.orderNumber}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600 dark:text-slate-400">
                    {t.cart?.total || "Total"}
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
                {t.common?.back || "Back"}
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
        title={t.checkout?.title || "Payment"}
        subtitle={
          tableNumber ? `${tenantSlug} • ${t.checkout?.table || "Table"} ${tableNumber}` : tenantSlug
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
                  {t.checkout?.orderNumber || "Order"}
                </p>
                <p className="font-bold text-lg">{order.orderNumber}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {t.checkout?.table || "Table"}
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
                <p className="text-slate-600 dark:text-slate-400">{t.cart?.subtotal || "Subtotal"}</p>
                <p>{formatPrice(order.subtotal)}</p>
              </div>
              {order.taxAmount > 0 && (
                <div className="flex justify-between text-sm mb-2">
                  <p className="text-slate-600 dark:text-slate-400">VAT</p>
                  <p>{formatPrice(order.taxAmount)}</p>
                </div>
              )}
              {order.discountAmount > 0 && (
                <div className="flex justify-between text-sm mb-2 text-emerald-600 dark:text-emerald-400">
                  <p className="font-medium">
                    {t.voucher?.title || "Discount"} {order.voucher?.code && `(${order.voucher.code})`}
                  </p>
                  <p className="font-bold">-{formatPrice(order.discountAmount)}</p>
                </div>
              )}
              <div className="flex justify-between text-lg font-bold mt-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                <p>{t.cart?.total || "Total"}</p>
                <p className="text-emerald-600 dark:text-emerald-400">
                  {formatPrice(order.totalAmount)}
                </p>
              </div>
            </div>
          </div>

          {/* Payment Method Selection */}
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 mb-6">
            <h3 className="font-bold text-lg mb-4">{t.checkout?.paymentMethod || "Payment Method"}</h3>
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
                      <p className="font-medium">{t.checkout?.cash || "Cash"}</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        {t.checkout?.cashDesc || "Pay with cash to staff"}
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
                      <p className="font-medium">{t.checkout?.qr || "QR Payment"}</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        {t.checkout?.qrDesc || "Scan QR code to pay via e-wallet"}
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
                  {t.checkout?.processing || "Processing..."}
                </>
              ) : (
                <>
                  <CreditCard className="size-5" />
                  {t.checkout?.payNow || "Pay Now"}
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
              {t.checkout?.processing || "Processing..."}
            </>
          ) : (
            <>
              <CreditCard className="size-5" />
              {t.checkout?.payNow || "Pay Now"}
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
