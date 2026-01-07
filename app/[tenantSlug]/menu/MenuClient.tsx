"use client";

import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ShoppingCart,
  Search,
  AlertTriangle,
  Loader2,
  ClipboardList,
} from "lucide-react";
import { MenuItemDTO, CartItemDTO } from "@/lib/types/menu";
import { useCartStore } from "@/lib/stores/cart-store";
import { LanguageProvider, useLanguage } from "@/lib/i18n/context";
import {
  useInfiniteMenuQuery,
  useCategoriesQuery,
  useChefPicksQuery,
} from "@/hooks/use-menu-query";
import { useQrToken } from "@/hooks/use-qr-token";
import { getQrToken, getTableId } from "@/lib/stores/qr-token-store";
import { decodeQrToken } from "@/lib/utils/jwt-decode";
import { orderApi } from "@/lib/api/order";
import { saveReturnUrl } from "@/lib/utils/return-url";
import { ChefPicksCarousel } from "@/components/menu/ChefPicksCarousel";
import { MenuItemCard } from "@/components/menu/MenuItemCard";
import { MenuSearchBar } from "@/components/menu/MenuSearchBar";
import { CategoryChips } from "@/components/menu/CategoryChips";
import { PageHeader } from "@/components/shared/PageHeader";
import { LiveIndicator } from "@/components/shared/LiveIndicator";
import { UserAvatar } from "@/components/auth/UserAvatar";
import { useTenantSettings } from "@/providers/tenant-settings-context";

interface MenuClientProps {
  tenantSlug: string;
  tableId?: string;
  token?: string;
}

// Loading more spinner component
function LoadingMore() {
  return (
    <div className="flex items-center justify-center py-6">
      <Loader2 className="size-6 animate-spin text-emerald-500" />
      <span className="ml-2 text-sm text-slate-400">Đang tải thêm...</span>
    </div>
  );
}

function MenuContent({
  tenantSlug,
  tableId: propsTableId,
  token: propsToken,
}: MenuClientProps) {
  const { t } = useLanguage();
  const { formatPrice } = useTenantSettings();
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<string>("popularityScore");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Active order state
  const [activeOrderNumber, setActiveOrderNumber] = useState<string | null>(
    null,
  );
  const [isCheckingOrder, setIsCheckingOrder] = useState(true);

  // Use props or fallback to persisted values from sessionStorage
  const tableId = propsTableId || getTableId() || undefined;
  const token = propsToken || getQrToken() || undefined;

  // Cart state from Zustand store (persisted to localStorage)
  const addToCart = useCartStore((state) => state.addItem);
  const cartItems = useCartStore((state) => state.items);
  const cartItemCount = useCartStore((state) => state.getItemCount());
  const cartSubtotal = useCartStore((state) => state.getSubtotal());

  // Ref for infinite scroll trigger
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // Decode token to get table number
  const tableNumber = useMemo(() => {
    if (!token) return null;
    const payload = decodeQrToken(token);
    return payload?.tableNumber || null;
  }, [token]);

  // URLs (no need to include table/token params - they're in storage)
  const orderHref = `/${tenantSlug}/my-order`;

  // Save returnUrl for redirect after login
  useEffect(() => {
    if (tenantSlug && tableId && token) {
      saveReturnUrl({
        tenantSlug,
        tableId,
        token,
        path: "/menu",
      });
    }
  }, [tenantSlug, tableId, token]);

  // Check for active order on mount
  useEffect(() => {
    const checkActiveOrder = async () => {
      try {
        const result = await orderApi.getMyOrder();
        if (result.success && result.data) {
          setActiveOrderNumber(result.data.orderNumber);
        }
      } catch (err) {
        // No active order - that's fine
        console.log("[Menu] No active order found");
      } finally {
        setIsCheckingOrder(false);
      }
    };
    checkActiveOrder();
  }, []);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Store QR token and tableId for API requests (persisted to sessionStorage)
  useQrToken(token, tableId);

  // Fetch categories
  const { data: categories, isLoading: categoriesLoading } =
    useCategoriesQuery();

  // Fetch chef picks separately
  const { data: chefPicksData, isLoading: chefPicksLoading } =
    useChefPicksQuery();

  const chefPicks = useMemo(() => {
    if (!chefPicksData?.data?.menu_items) return [];
    return chefPicksData.data.menu_items;
  }, [chefPicksData]);

  // Fetch menu items with infinite scroll
  const {
    data: menuData,
    isLoading: menuLoading,
    error: menuError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteMenuQuery({
    category_id: selectedCategory || undefined,
    search: debouncedSearch || undefined,
    limit: 20,
    sort_by: sortBy as "createdAt" | "name" | "basePrice" | "popularityScore",
    sort_order: sortOrder,
  });

  // Flatten all pages into single array
  const items = useMemo(() => {
    if (!menuData?.pages) return [];
    return menuData.pages.flatMap((page) => page.data.menu_items);
  }, [menuData]);

  const isLoading = categoriesLoading || menuLoading;

  // Intersection Observer for infinite scroll
  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries;
      if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    },
    [fetchNextPage, hasNextPage, isFetchingNextPage],
  );

  useEffect(() => {
    const element = loadMoreRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(handleObserver, {
      root: null,
      rootMargin: "100px",
      threshold: 0,
    });

    observer.observe(element);
    return () => observer.disconnect();
  }, [handleObserver]);

  // Quick add to cart handler - creates CartItemDTO and adds to store
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
    addToCart(cartItem);
  };

  // Handle category change - reset pagination
  const handleCategoryChange = (categoryId: string | null) => {
    setSelectedCategory(categoryId);
  };

  // Error state
  if (menuError) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 dark:bg-slate-900 px-6 text-center text-slate-900 dark:text-white">
        <div className="mb-6 flex size-20 items-center justify-center rounded-full bg-red-500/10">
          <AlertTriangle className="size-10 text-red-500" />
        </div>
        <h1 className="mb-2 text-2xl font-bold">Không thể tải menu</h1>
        <p className="mb-8 max-w-sm text-slate-500 dark:text-slate-400">
          Vui lòng thử lại sau
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 text-slate-900 dark:text-white transition-colors">
      {/* Header */}
      <PageHeader
        title={tenantSlug}
        subtitle={tableNumber ? `Bàn ${tableNumber}` : "Menu"}
        backHref={`/${tenantSlug}`}
        rightContent={
          <div className="flex items-center gap-2">
            <Link
              href={`/${tenantSlug}/cart`}
              className="relative flex size-10 items-center justify-center rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-slate-800"
            >
              <ShoppingCart className="size-5" />
              {cartItemCount > 0 && (
                <LiveIndicator size="sm" className="absolute right-1 top-1" />
              )}
            </Link>
            <UserAvatar />
          </div>
        }
        maxWidth="full"
        bottomBorder={false}
      />

      {/* Sticky Search & Categories */}
      <div className="sticky top-16 z-30 border-b border-gray-200 dark:border-slate-700/50 bg-gray-50/95 dark:bg-slate-900/95 backdrop-blur-md">
        {/* Search */}
        <MenuSearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder={t.menu.search}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSortChange={(newSortBy, newSortOrder) => {
            setSortBy(newSortBy);
            setSortOrder(newSortOrder);
          }}
        />

        {/* Categories */}
        {categories && categories.length > 0 && (
          <CategoryChips
            categories={categories.filter((c) => c.is_active)}
            selectedCategory={selectedCategory}
            onSelect={handleCategoryChange}
          />
        )}

        {/* Loading state for categories */}
        {isLoading && !categories && (
          <div className="flex gap-3 overflow-hidden px-4 pb-3 md:px-6">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton
                key={i}
                className="h-9 w-20 shrink-0 rounded-full bg-gray-200 dark:bg-slate-800"
              />
            ))}
          </div>
        )}
      </div>

      {/* Content */}
      <main className="flex-1 overflow-y-auto">
        {/* Active Order Banner - Show when user has an active order */}
        {!isCheckingOrder && activeOrderNumber && (
          <div className="mx-4 mt-4 p-3 sm:p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-200 dark:border-emerald-800">
            <div className="flex items-center justify-between gap-3">
              {/* Info section */}
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex size-8 sm:size-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-800">
                  <ClipboardList className="size-4 sm:size-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-emerald-800 dark:text-emerald-300 text-sm sm:text-base">
                    Bạn đang có đơn hàng
                  </p>
                  <p className="text-xs sm:text-sm text-emerald-600 dark:text-emerald-400 truncate">
                    Đơn #{activeOrderNumber}
                  </p>
                </div>
              </div>
              {/* Button */}
              <Link href={orderHref} className="shrink-0">
                <Button
                  size="sm"
                  className="bg-emerald-500 text-white hover:bg-emerald-600"
                >
                  Xem đơn
                </Button>
              </Link>
            </div>
          </div>
        )}

        {/* Chef Picks Carousel - Only show when not searching and no category selected */}
        {!searchQuery && !selectedCategory && chefPicks.length > 0 && (
          <ChefPicksCarousel items={chefPicks} tenantSlug={tenantSlug} />
        )}
        {menuLoading && items.length === 0 ? (
          // Initial loading skeleton
          <div className="space-y-6 px-4 py-6 md:px-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="h-6 w-32 bg-gray-200 dark:bg-slate-800" />
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <Skeleton className="h-32 rounded-xl bg-gray-200 dark:bg-slate-800" />
                  <Skeleton className="h-32 rounded-xl bg-gray-200 dark:bg-slate-800" />
                </div>
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          // Empty state
          <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
            <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-gray-100 dark:bg-slate-800">
              <Search className="size-8 text-slate-400 dark:text-slate-500" />
            </div>
            <h3 className="mb-2 text-lg font-bold">{t.menu.noResults}</h3>
            <p className="mb-6 text-sm text-slate-500 dark:text-slate-400">
              {t.menu.noResultsDescription}
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory(null);
              }}
              className="border-gray-300 dark:border-slate-700 bg-transparent hover:bg-gray-100 dark:hover:bg-slate-800"
            >
              {t.menu.clearSearch}
            </Button>
          </div>
        ) : (
          <>
            {/* Menu Items */}
            <div className="px-4 py-6 md:px-6">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {items.map((item) => (
                  <MenuItemCard
                    key={item.id}
                    item={item}
                    onQuickAdd={handleQuickAdd}
                    href={`/${tenantSlug}/menu/${item.id}`}
                  />
                ))}
              </div>
            </div>

            {/* Load more trigger - Intersection Observer target */}
            <div ref={loadMoreRef} className="h-1" />

            {/* Loading more indicator */}
            {isFetchingNextPage && <LoadingMore />}

            {/* End of list indicator */}
            {!hasNextPage && items.length > 0 && (
              <div className="py-6 text-center text-sm text-slate-500">
                Đã hiển thị tất cả {items.length} món
              </div>
            )}
          </>
        )}
      </main>

      {/* Sticky Cart Bar */}
      {cartItemCount > 0 && (
        <div className="fixed bottom-0 left-1/2 z-50 w-full max-w-[480px] -translate-x-1/2 px-4 pb-[calc(env(safe-area-inset-bottom,16px)+16px)] lg:max-w-2xl">
          <Link href={`/${tenantSlug}/cart`}>
            <Button className="flex h-14 w-full items-center justify-between rounded-full bg-emerald-500 px-4 text-white shadow-lg shadow-emerald-500/30 transition-all hover:bg-emerald-600 active:scale-[0.98]">
              <div className="flex items-center gap-3">
                {/* Stacked Avatars */}
                <div className="flex items-center">
                  {cartItems.slice(0, 5).map((item, index) => {
                    // Create unique key based on menuItemId and modifiers to avoid duplicate keys
                    // Same item with different modifiers should have different keys
                    const modifiersKey =
                      item.selectedModifiers
                        ?.map((m) => m.modifierId)
                        .sort()
                        .join(",") || "";
                    const uniqueKey = modifiersKey
                      ? `${item.menuItemId}-${modifiersKey}`
                      : `${item.menuItemId}-${index}`;

                    return (
                      <div
                        key={uniqueKey}
                        className="relative size-8 rounded-full border-2 border-emerald-500 bg-white overflow-hidden"
                        style={{
                          marginLeft: index === 0 ? 0 : -12,
                          zIndex: 10 - index,
                        }}
                      >
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.menuItemName}
                            className="size-full object-cover"
                          />
                        ) : (
                          <div className="size-full bg-emerald-200 flex items-center justify-center text-emerald-700 text-xs font-bold">
                            {item.menuItemName.charAt(0)}
                          </div>
                        )}
                      </div>
                    );
                  })}
                  {cartItems.length > 5 && (
                    <div
                      className="relative size-8 rounded-full border-2 border-emerald-500 bg-emerald-700 flex items-center justify-center text-white text-xs font-bold"
                      style={{ marginLeft: -12, zIndex: 5 }}
                    >
                      +{cartItems.length - 5}
                    </div>
                  )}
                </div>
                <span className="font-bold">{formatPrice(cartSubtotal)}</span>
              </div>

              <div className="flex items-center gap-2 font-bold">
                <span>{t.menu.viewCart}</span>
                <ShoppingCart className="size-5" />
              </div>
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}

export function MenuClient(props: MenuClientProps) {
  return (
    <LanguageProvider>
      <MenuContent {...props} />
    </LanguageProvider>
  );
}
