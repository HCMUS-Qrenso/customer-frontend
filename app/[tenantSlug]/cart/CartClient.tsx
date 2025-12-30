"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShoppingCart, Plus, Trash2, ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LanguageProvider, useLanguage } from "@/lib/i18n/context";
import { MenuItemDTO } from "@/lib/types/menu";
import { formatVND } from "@/lib/format";
import { useQrToken } from "@/hooks/use-qr-token";
import { mockUpsellItems } from "@/lib/mocks";
import { CartItemCard } from "@/components/cart/CartItemCard";
import { PricingSummaryCard } from "@/components/cart/PricingSummaryCard";
import { PageHeader } from "@/components/shared/PageHeader";
import { MobileStickyBar } from "@/components/shared/MobileStickyBar";
import { useCartStore } from "@/lib/stores/cart-store";
import { orderApi } from "@/lib/api/order";
import { tableSessionApi } from "@/lib/api/table-session";
import {
  setSessionToken,
  getSessionToken,
  hasActiveSession,
} from "@/lib/stores/qr-token-store";

interface CartClientProps {
  tenantSlug: string;
  tableId?: string;
  token?: string;
}

function CartContent({ tenantSlug, tableId, token }: CartClientProps) {
  const router = useRouter();
  const { t, lang } = useLanguage();
  
  // Use Zustand cart store instead of local state
  const cartItems = useCartStore((state) => state.items);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);
  const clearCart = useCartStore((state) => state.clearCart);

  // Loading and error states for order creation
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Store QR token for API requests
  useQrToken(token);

  const menuHref = `/${tenantSlug}/menu?table=${tableId}&token=${token}`;
  const orderHref = `/${tenantSlug}/order?table=${tableId}&token=${token}`;

  // Handle quantity update
  const handleUpdateQuantity = (menuItemId: string, delta: number) => {
    const item = cartItems.find((i) => i.menuItemId === menuItemId);
    if (item) {
      updateQuantity(menuItemId, Math.max(0, item.quantity + delta));
    }
  };

  // Handle remove item
  const handleRemoveItem = (menuItemId: string) => {
    removeItem(menuItemId);
  };

  // Handle clear cart
  const handleClearCart = () => {
    clearCart();
  };

  /**
   * Handle place order flow:
   * 1. Start session if not exists (get session token)
   * 2. Create order with cart items
   * 3. Clear cart and redirect to order page
   */
  const handlePlaceOrder = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Step 1: Ensure we have a session
      let sessionToken = getSessionToken();
      if (!sessionToken) {
        console.log("[Cart] No session token, starting new session...");
        const sessionResult = await tableSessionApi.startSession({
          tenantSlug,
          tableCode: tableId || "",
          preferredLanguage: "vi",
        });
        sessionToken = sessionResult.sessionToken;
        if (sessionToken) {
          setSessionToken(sessionToken);
          console.log("[Cart] Session started, token saved");
        } else {
          throw new Error("Failed to start session");
        }
      }

      // Step 2: Create order
      console.log("[Cart] Creating order with", cartItems.length, "items");
      const orderResult = await orderApi.createOrder(cartItems);
      
      if (orderResult.success && orderResult.data) {
        console.log("[Cart] Order created:", orderResult.data.orderNumber);
        
        // Step 3: Clear cart and redirect
        clearCart();
        router.push(orderHref);
      } else {
        throw new Error(orderResult.message || "Failed to create order");
      }
    } catch (err: any) {
      console.error("[Cart] Order error:", err);
      setError(err.message || "Đã có lỗi xảy ra. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate totals
  const calculations = useMemo(() => {
    const subtotal = cartItems.reduce((sum, item) => sum + item.totalPrice, 0);
    const serviceCharge = Math.round(subtotal * 0.05);
    const tax = Math.round(subtotal * 0.1);
    const total = subtotal + serviceCharge + tax;
    const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    return { subtotal, serviceCharge, tax, total, itemCount };
  }, [cartItems]);

  // Empty cart state
  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 text-slate-900 dark:text-white flex flex-col transition-colors">
        <PageHeader title={t.cart.title} backHref={menuHref} />

        {/* Empty State */}
        <div className="flex-1 flex flex-col items-center justify-center px-6 py-16 text-center">
          <div className="mb-4 flex size-20 items-center justify-center rounded-full bg-gray-100 dark:bg-slate-800">
            <ShoppingCart className="size-10 text-slate-400 dark:text-slate-500" />
          </div>
          <h3 className="mb-2 text-xl font-bold">{t.cart.emptyTitle}</h3>
          <p className="mb-8 text-sm text-slate-500 dark:text-slate-400 max-w-xs">
            {t.cart.emptyMessage}
          </p>
          <Link href={menuHref}>
            <Button className="gap-2 bg-emerald-500 text-white hover:bg-emerald-600">
              <ArrowLeft className="size-4" />
              {t.cart.backToMenu}
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 text-slate-900 dark:text-white flex flex-col transition-colors">
      <PageHeader
        title={t.cart.title}
        backHref={menuHref}
        maxWidth="6xl"
        rightContent={
          <button
            onClick={handleClearCart}
            disabled={isLoading}
            className="px-3 h-9 flex items-center justify-center gap-1.5 rounded-full text-sm font-medium text-red-500 hover:bg-red-500/10 transition-colors disabled:opacity-50"
          >
            <Trash2 className="size-4" />
            <span className="hidden sm:inline">{t.cart.clearAll}</span>
          </button>
        }
      />

      {/* Error message */}
      {error && (
        <div className="mx-4 mt-4 p-3 bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Main Content */}
      <main className="flex-grow w-full max-w-6xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-12 gap-8 pb-32 lg:pb-6">
        {/* Left: Cart Items */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <div className="flex flex-col gap-4">
            {cartItems.map((item) => (
              <CartItemCard
                key={`${item.menuItemId}-${item.selectedModifiers?.map(m => m.modifierId).join(',')}`}
                item={item}
                onUpdateQuantity={(delta) =>
                  handleUpdateQuantity(item.menuItemId, delta)
                }
                onRemove={() => handleRemoveItem(item.menuItemId)}
              />
            ))}
          </div>

          {/* Upsell Section */}
          {mockUpsellItems.length > 0 && (
            <div className="mt-4">
              <h2 className="text-base font-semibold mb-4 text-slate-900 dark:text-white">
                {t.cart.youMayLike}
              </h2>
              <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory no-scrollbar">
                {mockUpsellItems.map((item) => (
                  <div
                    key={item.id}
                    className="snap-start shrink-0 w-36 bg-white dark:bg-slate-800 rounded-xl p-3 border border-gray-100 dark:border-slate-700/50"
                  >
                    <div
                      className="aspect-square rounded-lg bg-gray-100 dark:bg-slate-700 mb-2 bg-cover bg-center"
                      style={{
                        backgroundImage: `url('${item.images.find((img: any) => img.is_primary)?.image_url || item.images[0]?.image_url}')`,
                      }}
                    />
                    <h4 className="font-medium text-sm truncate text-slate-900 dark:text-white">
                      {item.name}
                    </h4>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs font-semibold text-emerald-500">
                        {formatVND(item.base_price)}
                      </span>
                      <button className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center hover:bg-emerald-500 hover:text-white transition-colors">
                        <Plus className="size-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: Summary (Desktop) */}
        <div className="lg:col-span-5 hidden lg:block">
          <PricingSummaryCard
            itemCount={calculations.itemCount}
            subtotal={calculations.subtotal}
            serviceCharge={calculations.serviceCharge}
            tax={calculations.tax}
            total={calculations.total}
            onPlaceOrder={handlePlaceOrder}
          />
        </div>
      </main>

      {/* Mobile Sticky Bottom Bar */}
      <MobileStickyBar maxWidth="6xl">
        <div className="flex gap-4 items-center">
          <div className="flex flex-col flex-1">
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {t.cart.total}
            </span>
            <span className="text-xl font-bold text-emerald-500">
              {formatVND(calculations.total)}
            </span>
          </div>
          <Button
            onClick={handlePlaceOrder}
            disabled={isLoading}
            className="flex-[2] h-12 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-full text-base flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="size-5 animate-spin" />
                <span>Đang xử lý...</span>
              </>
            ) : (
              <span>{t.cart.placeOrder}</span>
            )}
          </Button>
        </div>
      </MobileStickyBar>
    </div>
  );
}

export function CartClient(props: CartClientProps) {
  return (
    <LanguageProvider>
      <CartContent {...props} />
    </LanguageProvider>
  );
}
