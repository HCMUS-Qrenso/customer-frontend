"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShoppingCart, Plus, Trash2, ArrowLeft, Loader2, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { LanguageProvider, useLanguage } from "@/lib/i18n/context";
import { MenuItemDTO, CartItemDTO } from "@/lib/types/menu";
import { formatVND } from "@/lib/format";
import { useQrToken } from "@/hooks/use-qr-token";
import { useMenuQuery } from "@/hooks/use-menu-query";
import { CartItemCard } from "@/components/cart/CartItemCard";
import { PricingSummaryCard } from "@/components/cart/PricingSummaryCard";
import { PageHeader } from "@/components/shared/PageHeader";
import { MobileStickyBar } from "@/components/shared/MobileStickyBar";
import { useCartStore } from "@/lib/stores/cart-store";
import { orderApi } from "@/lib/api/order";
import { tableSessionApi } from "@/lib/api/table-session";
import { decodeQrToken } from "@/lib/utils/jwt-decode";
import {
  setSessionToken,
  getSessionToken,
} from "@/lib/stores/qr-token-store";
import { UserAvatar } from "@/components/auth/UserAvatar";
import { saveReturnUrl } from "@/lib/utils/return-url";

interface CartClientProps {
  tenantSlug: string;
  tableId?: string;
  token?: string;
}

function CartContent({ tenantSlug, tableId, token }: CartClientProps) {
  const router = useRouter();
  const { t, lang } = useLanguage();
  
  // Use Zustand cart store
  const cartItems = useCartStore((state) => state.items);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const updateItemNotes = useCartStore((state) => state.updateItemNotes);
  const removeItem = useCartStore((state) => state.removeItem);
  const clearCart = useCartStore((state) => state.clearCart);
  const addItem = useCartStore((state) => state.addItem);

  // Loading and error states for order creation
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);


  // Store QR token for API requests
  useQrToken(token, tableId);

  // Save returnUrl for redirect after login
  useEffect(() => {
    if (tenantSlug && tableId && token) {
      saveReturnUrl({
        tenantSlug,
        tableId,
        token,
        path: "/cart",
      });
    }
  }, [tenantSlug, tableId, token]);

  // Decode token to get table number
  const tableNumber = useMemo(() => {
    if (!token) return null;
    const payload = decodeQrToken(token);
    return payload?.tableNumber || null;
  }, [token]);

  // Header subtitle with table number
  const headerSubtitle = tableNumber ? `${tenantSlug} • Bàn ${tableNumber}` : tenantSlug;

  // Fetch top 5 popular items for upsell
  const { data: popularItemsData, isLoading: popularLoading } = useMenuQuery({
    sort_by: "popularityScore",
    sort_order: "desc",
    limit: 5,
    status: "available",
  });

  const popularItems = useMemo(() => {
    if (!popularItemsData?.data?.menu_items) return [];
    // Filter out items already in cart
    const cartItemIds = new Set(cartItems.map((i) => i.menuItemId));
    return popularItemsData.data.menu_items.filter((item) => !cartItemIds.has(item.id));
  }, [popularItemsData, cartItems]);

  const menuHref = `/${tenantSlug}/menu?table=${tableId}&token=${token}`;
  const orderHref = `/${tenantSlug}/my-order?table=${tableId}&token=${token}`;



  // Handle quantity update
  const handleUpdateQuantity = (menuItemId: string, delta: number) => {
    const item = cartItems.find((i) => i.menuItemId === menuItemId);
    if (item) {
      updateQuantity(menuItemId, Math.max(0, item.quantity + delta));
    }
  };

  // Handle notes update
  const handleUpdateNotes = (menuItemId: string, notes: string) => {
    updateItemNotes(menuItemId, notes);
  };

  // Handle remove item
  const handleRemoveItem = (menuItemId: string) => {
    removeItem(menuItemId);
  };

  // Handle clear cart
  const handleClearCart = () => {
    clearCart();
  };

  // Handle quick add from upsell
  const handleQuickAdd = (item: MenuItemDTO) => {
    // API returns base_price as string, need to convert to number for calculations
    const basePrice =
      typeof item.base_price === "string"
        ? parseInt(item.base_price, 10)
        : item.base_price;

    const cartItem: CartItemDTO = {
      menuItemId: item.id,
      menuItemName: item.name,
      quantity: 1,
      basePrice: basePrice,
      image: item.images?.[0]?.image_url,
      selectedModifiers: [],
      notes: undefined,
      totalPrice: basePrice,
    };
    addItem(cartItem);
  };

  /**
   * Handle place order flow:
   * 1. Start session if not exists (get session token)
   * 2. Check if there's an existing active order
   * 3. Add items to existing order OR create new order
   * 4. Clear cart and redirect to order page
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
        
        // Backend returns session_token in data object
        sessionToken = sessionResult.data?.session_token;
        if (sessionToken) {
          setSessionToken(sessionToken);
          console.log("[Cart] Session started, token saved:", sessionToken.substring(0, 20) + "...");
        } else {
          console.error("[Cart] No session token in response:", sessionResult);
          throw new Error("Failed to start session - no token returned");
        }
      }

      // Step 2: Try to create order, or add items if order already exists
      let orderResult;
      try {
        // First, try to create a new order
        console.log("[Cart] Attempting to create order with", cartItems.length, "items");
        orderResult = await orderApi.createOrder(cartItems);
      } catch (createError: any) {
        // If error is "already has active order", get the order and add items
        if (createError.message?.includes("already has an active order") || 
            createError.message?.includes("active order")) {
          console.log("[Cart] Table has active order, fetching order to add items...");
          try {
            const existingOrder = await orderApi.getMyOrder();
            if (existingOrder.success && existingOrder.data) {
              console.log("[Cart] Found order:", existingOrder.data.orderNumber, "- Adding items...");
              orderResult = await orderApi.addItemsToOrder(existingOrder.data.id, cartItems);
            } else {
              throw new Error("Không thể tìm thấy đơn hàng hiện tại");
            }
          } catch (addError: any) {
            console.error("[Cart] Failed to add items to order:", addError);
            throw new Error("Không thể thêm món vào đơn hàng: " + addError.message);
          }
        } else {
          // Re-throw other errors
          throw createError;
        }
      }
      
      if (orderResult?.success && orderResult?.data) {
        console.log("[Cart] Order processed:", orderResult.data.orderNumber);
        
        // Step 3: Clear cart and redirect
        clearCart();
        router.push(orderHref);
      } else {
        throw new Error(orderResult?.message || "Failed to process order");
      }
    } catch (err: any) {
      console.error("[Cart] Order error:", err);
      setError(err.message || "Đã có lỗi xảy ra. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate totals - only subtotal for cart, tax/fees will be calculated at checkout
  const calculations = useMemo(() => {
    const subtotal = cartItems.reduce((sum, item) => sum + item.totalPrice, 0);
    const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    return { subtotal, itemCount };
  }, [cartItems]);

  // Empty cart state
  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 text-slate-900 dark:text-white flex flex-col transition-colors">
        <PageHeader title={t.cart.title} subtitle={headerSubtitle} backHref={menuHref} />

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
        subtitle={headerSubtitle}
        backHref={menuHref}
        maxWidth="full"
        rightContent={
          <div className="flex items-center gap-2">
            <button
              onClick={handleClearCart}
              disabled={isLoading}
              className="px-3 h-9 flex items-center justify-center gap-1.5 rounded-full text-sm font-medium text-red-500 hover:bg-red-500/10 transition-colors disabled:opacity-50"
            >
              <Trash2 className="size-4" />
              <span className="hidden sm:inline">{t.cart.clearAll}</span>
            </button>
            <UserAvatar />
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
      <main className="grow w-full max-w-6xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-12 gap-8 pb-32 lg:pb-6">
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
                onUpdateNotes={(notes) => handleUpdateNotes(item.menuItemId, notes)}
              />
            ))}
          </div>

          {/* Upsell Section - Top 5 Popular Items */}
          <div className="mt-4">
            <h2 className="text-base font-semibold mb-4 text-slate-900 dark:text-white">
              {t.cart.youMayLike}
            </h2>
            {popularLoading ? (
              <div className="flex gap-4 overflow-x-auto pb-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="shrink-0 w-36">
                    <Skeleton className="aspect-square rounded-lg bg-gray-200 dark:bg-slate-700 mb-2" />
                    <Skeleton className="h-4 w-24 bg-gray-200 dark:bg-slate-700" />
                    <Skeleton className="h-3 w-16 mt-1 bg-gray-200 dark:bg-slate-700" />
                  </div>
                ))}
              </div>
            ) : popularItems.length > 0 ? (
              <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory no-scrollbar">
                {popularItems.map((item) => (
                  <div
                    key={item.id}
                    className="snap-start shrink-0 w-36 bg-white dark:bg-slate-800 rounded-xl p-3 border border-gray-100 dark:border-slate-700/50"
                  >
                    <div
                      className="aspect-square rounded-lg bg-gray-100 dark:bg-slate-700 mb-2 bg-cover bg-center"
                      style={{
                        backgroundImage: `url('${item.images?.find((img) => img.is_primary)?.image_url || item.images?.[0]?.image_url || ""}')`,
                      }}
                    />
                    <h4 className="font-medium text-sm truncate text-slate-900 dark:text-white">
                      {item.name}
                    </h4>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs font-semibold text-emerald-500">
                        {formatVND(item.base_price)}
                      </span>
                      <button
                        onClick={() => handleQuickAdd(item)}
                        className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center hover:bg-emerald-500 hover:text-white transition-colors"
                      >
                        <Plus className="size-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        </div>

        {/* Right: Summary (Desktop) */}
        <div className="lg:col-span-5 hidden lg:block">
          <PricingSummaryCard
            itemCount={calculations.itemCount}
            subtotal={calculations.subtotal}
            onPlaceOrder={handlePlaceOrder}
            isLoading={isLoading}
          />
        </div>
      </main>

      {/* Mobile Sticky Bottom Bar - Simplified with subtotal only */}
      <MobileStickyBar maxWidth="6xl">
        <div className="flex gap-4 items-center">
          <div className="flex flex-col flex-1">
            <div className="flex items-center gap-1">
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {t.cart.subtotal}
              </span>
              <div className="group relative">
                <Info className="size-3 text-slate-400 cursor-help" />
                <div className="absolute bottom-full left-0 mb-2 hidden group-hover:block w-40 p-2 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-gray-200 dark:border-slate-700 text-xs z-50">
                  <p className="text-slate-500 dark:text-slate-400">
                    Thuế, phí dịch vụ sẽ được tính khi thanh toán
                  </p>
                </div>
              </div>
            </div>
            <span className="text-xl font-bold text-emerald-500">
              {formatVND(calculations.subtotal)}
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
