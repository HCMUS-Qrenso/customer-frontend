'use client';

import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, ShoppingCart, Search, AlertTriangle, Loader2 } from 'lucide-react';
import { MenuItemDTO, CartSummaryDTO } from '@/lib/types/menu';
import { LanguageProvider, useLanguage } from '@/lib/i18n/context';
import { LanguageToggle } from '@/components/LanguageToggle';
import { useInfiniteMenuQuery, useCategoriesQuery } from '@/hooks/use-menu-query';

interface MenuClientProps {
  tenantSlug: string;
  tableId?: string;
  token?: string;
}

// Simple search bar component
function MenuSearchBar({ 
  value, 
  onChange, 
  placeholder 
}: { 
  value: string; 
  onChange: (v: string) => void; 
  placeholder: string;
}) {
  return (
    <div className="px-4 pb-3 md:px-6">
      <div className="flex h-12 w-full items-stretch rounded-xl bg-slate-800">
        <div className="flex items-center justify-center pl-4 text-slate-400">
          <Search className="size-5" />
        </div>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="flex h-full w-full min-w-0 flex-1 border-none bg-transparent px-3 text-base text-white placeholder:text-slate-500 focus:outline-none"
        />
      </div>
    </div>
  );
}

// Category chips component
function CategoryChips({ 
  categories, 
  selectedCategory, 
  onSelect 
}: { 
  categories: { id: string; name: string }[];
  selectedCategory: string | null;
  onSelect: (id: string | null) => void;
}) {
  return (
    <div className="flex gap-3 overflow-x-auto px-4 pb-3 no-scrollbar scroll-smooth md:px-6">
      <Button
        variant={selectedCategory === null ? 'default' : 'secondary'}
        size="sm"
        onClick={() => onSelect(null)}
        className={`h-9 shrink-0 rounded-full px-5 transition-transform active:scale-95 ${
          selectedCategory === null
            ? 'bg-emerald-500 text-emerald-950 font-bold shadow-md hover:bg-emerald-600'
            : 'bg-slate-800 text-slate-200 font-medium hover:bg-slate-700'
        }`}
      >
        Tất cả
      </Button>
      
      {categories.map((category) => (
        <Button
          key={category.id}
          variant={selectedCategory === category.id ? 'default' : 'secondary'}
          size="sm"
          onClick={() => onSelect(category.id)}
          className={`h-9 shrink-0 rounded-full px-5 transition-transform active:scale-95 ${
            selectedCategory === category.id
              ? 'bg-emerald-500 text-emerald-950 font-bold shadow-md hover:bg-emerald-600'
              : 'bg-slate-800 text-slate-200 font-medium hover:bg-slate-700'
          }`}
        >
          {category.name}
        </Button>
      ))}
    </div>
  );
}

// Menu item card component
function MenuItemCard({ 
  item, 
  onQuickAdd 
}: { 
  item: MenuItemDTO;
  onQuickAdd: (item: MenuItemDTO) => void;
}) {
  const isInactive = item.status === 'inactive';
  const imageUrl = item.images?.[0] || 'https://via.placeholder.com/150';

  return (
    <div 
      className={`
        relative flex h-32 overflow-hidden rounded-xl transition-shadow
        ${isInactive ? 'opacity-70' : 'hover:shadow-md cursor-pointer'}
        bg-slate-800
      `}
    >
      {/* Image */}
      <div className="relative h-full w-32 shrink-0">
        <div
          className={`h-full w-full bg-cover bg-center ${isInactive ? 'grayscale' : ''}`}
          style={{ backgroundImage: `url('${imageUrl}')` }}
        />
        {isInactive && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <span className="rounded border border-white px-2 py-0.5 text-xs font-bold uppercase text-white">
              Hết món
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col justify-between p-3 min-w-0">
        <div className="min-w-0">
          <h4 className="font-bold leading-tight text-white truncate">
            {item.name}
          </h4>
          {item.description && (
            <p className="mt-1 line-clamp-2 text-xs text-slate-400">
              {item.description}
            </p>
          )}
        </div>

        <div className="flex items-end justify-between mt-auto">
          <div className="flex flex-col">
            <span className={`font-bold text-emerald-400 ${isInactive ? 'text-slate-500' : ''}`}>
              {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.base_price)}
            </span>
          </div>

          {!isInactive && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onQuickAdd(item)}
              className="size-8 rounded-full bg-emerald-500/20 text-emerald-500 hover:bg-emerald-500/30"
            >
              <span className="text-lg">+</span>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
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
  
  // Mock cart state
  const [cart, setCart] = useState<CartSummaryDTO>({ count: 0, subtotal: 0 });
  
  // Ref for infinite scroll trigger
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch categories
  const { 
    data: categories, 
    isLoading: categoriesLoading 
  } = useCategoriesQuery();

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
    status: 'active',
    limit: 20,
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
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-900 px-6 text-center text-white">
        <div className="mb-6 flex size-20 items-center justify-center rounded-full bg-red-500/10">
          <AlertTriangle className="size-10 text-red-500" />
        </div>
        <h1 className="mb-2 text-2xl font-bold">Không thể tải menu</h1>
        <p className="mb-8 max-w-sm text-slate-400">Vui lòng thử lại sau</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Sticky Header */}
      <div className="sticky top-0 z-40 border-b border-slate-700/50 bg-slate-900/95 backdrop-blur-md">
        {/* Top Bar */}
        <header className="flex items-center justify-between px-4 py-3 md:px-6">
          <div className="flex items-center gap-3">
            <Link
              href={`/${tenantSlug}?table=${tableId}&token=${token}`}
              className="flex size-10 items-center justify-center rounded-full bg-slate-800 transition-colors hover:bg-slate-700"
            >
              <ArrowLeft className="size-5" />
            </Link>
            <div className="flex flex-col">
              <h2 className="text-lg font-bold leading-tight tracking-tight">{tenantSlug}</h2>
              <span className="text-xs font-medium text-slate-400">
                {tableId ? `Bàn ${tableId.slice(0, 8)}...` : 'Menu'}
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            <LanguageToggle />
            <Link
              href={`/${tenantSlug}/cart`}
              className="relative flex size-10 items-center justify-center rounded-lg transition-colors hover:bg-slate-800"
            >
              <ShoppingCart className="size-5" />
              {cart.count > 0 && (
                <span className="absolute right-1 top-1 flex size-2.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75" />
                  <span className="relative inline-flex size-2.5 rounded-full bg-emerald-500" />
                </span>
              )}
            </Link>
          </div>
        </header>

        {/* Search */}
        <MenuSearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder={t.menu.search}
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
              <Skeleton key={i} className="h-9 w-20 shrink-0 rounded-full bg-slate-800" />
            ))}
          </div>
        )}
      </div>

      {/* Content */}
      <main className="flex-1 overflow-y-auto pb-24">
        {menuLoading && items.length === 0 ? (
          // Initial loading skeleton
          <div className="space-y-6 px-4 py-6 md:px-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="h-6 w-32 bg-slate-800" />
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <Skeleton className="h-32 rounded-xl bg-slate-800" />
                  <Skeleton className="h-32 rounded-xl bg-slate-800" />
                </div>
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          // Empty state
          <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
            <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-slate-800">
              <Search className="size-8 text-slate-500" />
            </div>
            <h3 className="mb-2 text-lg font-bold">{t.menu.noResults}</h3>
            <p className="mb-6 text-sm text-slate-400">{t.menu.noResultsDescription}</p>
            <Button
              variant="outline"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory(null);
              }}
              className="border-slate-700 bg-transparent text-white hover:bg-slate-800"
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
              className="flex h-14 w-full items-center justify-between rounded-full bg-emerald-500 px-5 text-emerald-950 shadow-lg shadow-emerald-500/30 transition-all hover:bg-emerald-600 active:scale-[0.98]"
            >
              <div className="flex items-center gap-3">
                <span className="flex size-7 items-center justify-center rounded-full bg-emerald-950/20 text-sm font-bold">
                  {cart.count}
                </span>
                <span className="font-bold">
                  {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(cart.subtotal)}
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
