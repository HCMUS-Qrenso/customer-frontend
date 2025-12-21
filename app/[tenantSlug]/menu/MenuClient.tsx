'use client';

import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ShoppingCart, Search, AlertTriangle, Loader2 } from 'lucide-react';
import { MenuItemDTO, CartSummaryDTO } from '@/lib/types/menu';
import { LanguageProvider, useLanguage } from '@/lib/i18n/context';
import { useInfiniteMenuQuery, useCategoriesQuery, useChefPicksQuery } from '@/hooks/use-menu-query';
import { setQrToken } from '@/lib/stores/qr-token-store';
import { decodeQrToken } from '@/lib/utils/jwt-decode';
import { formatVND } from '@/lib/format';
import { ChefPicksCarousel } from '@/components/menu/ChefPicksCarousel';
import { MenuItemCard } from '@/components/menu/MenuItemCard';
import { MenuSearchBar } from '@/components/menu/MenuSearchBar';
import { CategoryChips } from '@/components/menu/CategoryChips';
import { PageHeader } from '@/components/shared/PageHeader';

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

function MenuContent({ tenantSlug, tableId, token }: MenuClientProps) {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<string>('popularityScore');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  // Mock cart state
  const [cart, setCart] = useState<CartSummaryDTO>({ count: 0, subtotal: 0 });
  
  // Ref for infinite scroll trigger
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // Decode token to get table number
  const tableNumber = useMemo(() => {
    if (!token) return null;
    const payload = decodeQrToken(token);
    return payload?.tableNumber || null;
  }, [token]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Store QR token for API requests
  useEffect(() => {
    if (token) {
      setQrToken(token);
    }
  }, [token]);

  // Fetch categories
  const { 
    data: categories, 
    isLoading: categoriesLoading 
  } = useCategoriesQuery();

  // Fetch chef picks separately
  const {
    data: chefPicksData,
    isLoading: chefPicksLoading,
  } = useChefPicksQuery();

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
    status: 'available',
    limit: 20,
    sort_by: sortBy as 'createdAt' | 'name' | 'basePrice' | 'popularityScore',
    sort_order: sortOrder,
  });

  // Flatten all pages into single array
  const items = useMemo(() => {
    if (!menuData?.pages) return [];
    return menuData.pages.flatMap(page => page.data.menu_items);
  }, [menuData]);

  const isLoading = categoriesLoading || menuLoading;

  // Intersection Observer for infinite scroll
  const handleObserver = useCallback((entries: IntersectionObserverEntry[]) => {
    const [entry] = entries;
    if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  useEffect(() => {
    const element = loadMoreRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(handleObserver, {
      root: null,
      rootMargin: '100px',
      threshold: 0,
    });

    observer.observe(element);
    return () => observer.disconnect();
  }, [handleObserver]);

  // Quick add to cart handler
  const handleQuickAdd = (item: MenuItemDTO) => {
    setCart((prev) => ({
      count: prev.count + 1,
      subtotal: prev.subtotal + item.base_price,
    }));
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
        <p className="mb-8 max-w-sm text-slate-500 dark:text-slate-400">Vui lòng thử lại sau</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 text-slate-900 dark:text-white transition-colors">
      {/* Header */}
      <PageHeader
        title={tenantSlug}
        subtitle={tableNumber ? `Bàn ${tableNumber}` : 'Menu'}
        backHref={`/${tenantSlug}?table=${tableId}&token=${token}`}
        rightContent={
          <Link
            href={`/${tenantSlug}/cart`}
            className="relative flex size-10 items-center justify-center rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-slate-800"
          >
            <ShoppingCart className="size-5" />
            {cart.count > 0 && (
              <span className="absolute right-1 top-1 flex size-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75" />
                <span className="relative inline-flex size-2.5 rounded-full bg-emerald-500" />
              </span>
            )}
          </Link>
        }
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
            categories={categories.filter(c => c.is_active)}
            selectedCategory={selectedCategory}
            onSelect={handleCategoryChange}
          />
        )}

        {/* Loading state for categories */}
        {isLoading && !categories && (
          <div className="flex gap-3 overflow-hidden px-4 pb-3 md:px-6">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-9 w-20 shrink-0 rounded-full bg-gray-200 dark:bg-slate-800" />
            ))}
          </div>
        )}
      </div>

      {/* Content */}
      <main className="flex-1 overflow-y-auto pb-24">
        {/* Chef Picks Carousel - Only show when not searching and no category selected */}
        {!searchQuery && !selectedCategory && chefPicks.length > 0 && (
          <ChefPicksCarousel
            items={chefPicks}
            tenantSlug={tenantSlug}
            tableCode={tableId || ''}
            token={token || ''}
          />
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
            <p className="mb-6 text-sm text-slate-500 dark:text-slate-400">{t.menu.noResultsDescription}</p>
            <Button
              variant="outline"
              onClick={() => {
                setSearchQuery('');
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
                    href={`/${tenantSlug}/menu/${item.id}?table=${tableId}&token=${token}`}
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
      {cart.count > 0 && (
        <div className="fixed bottom-0 left-1/2 z-50 w-full max-w-[480px] -translate-x-1/2 px-4 pb-[calc(env(safe-area-inset-bottom,16px)+16px)] lg:max-w-2xl">
          <Link href={`/${tenantSlug}/cart`}>
            <Button 
              className="flex h-14 w-full items-center justify-between rounded-full bg-emerald-500 px-5 text-white shadow-lg shadow-emerald-500/30 transition-all hover:bg-emerald-600 active:scale-[0.98]"
            >
              <div className="flex items-center gap-3">
                <span className="flex size-7 items-center justify-center rounded-full bg-emerald-950/20 text-sm font-bold">
                  {cart.count}
                </span>
                <span className="font-bold">
                  {formatVND(cart.subtotal)}
                </span>
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
