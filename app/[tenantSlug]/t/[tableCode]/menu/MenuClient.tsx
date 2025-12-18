'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, ShoppingCart, Search } from 'lucide-react';
import { MenuListDTO, MenuItemDTO, CartSummaryDTO } from '@/app/lib/types/menu-types';
import { LanguageProvider, useLanguage } from '@/app/lib/i18n/context';
import { Language } from '@/app/lib/i18n/translations';
import { LanguageToggle } from '@/app/components/LanguageToggle';
import { CategoryChips } from '@/app/components/menu/CategoryChips';
import { MenuSearchBar } from '@/app/components/menu/MenuSearchBar';
import { MenuItemCard } from '@/app/components/menu/MenuItemCard';
import { ChefPicksCarousel } from '@/app/components/menu/ChefPicksCarousel';
import { StickyCartBar } from '@/app/components/menu/StickyCartBar';

interface MenuClientProps {
  tenantSlug: string;
  tableCode: string;
  tenantName: string;
  tableNumber: string;
}

function MenuContent({ tenantSlug, tableCode, tenantName, tableNumber }: MenuClientProps) {
  const { t, lang } = useLanguage();
  const [menuData, setMenuData] = useState<MenuListDTO | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [debouncedSearch, setDebouncedSearch] = useState('');
  
  // Mock cart state
  const [cart, setCart] = useState<CartSummaryDTO>({ count: 0, subtotal: 0 });

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch menu data
  const fetchMenu = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({ tenantSlug });
      if (selectedCategory) params.set('categoryId', selectedCategory);
      if (debouncedSearch) params.set('q', debouncedSearch);

      const response = await fetch(`/api/public/menu?${params}`);
      if (response.ok) {
        const data: MenuListDTO = await response.json();
        setMenuData(data);
      }
    } catch (error) {
      console.error('Failed to fetch menu:', error);
    } finally {
      setIsLoading(false);
    }
  }, [tenantSlug, selectedCategory, debouncedSearch]);

  useEffect(() => {
    fetchMenu();
  }, [fetchMenu]);

  // Filter items for display
  const filteredItems = useMemo(() => {
    if (!menuData) return [];
    return menuData.items;
  }, [menuData]);

  // Chef picks (only show when no filter)
  const chefPicks = useMemo(() => {
    if (!menuData || selectedCategory || debouncedSearch) return [];
    return menuData.items.filter((item) => item.isChefRecommendation).slice(0, 5);
  }, [menuData, selectedCategory, debouncedSearch]);

  // Group items by category
  const groupedItems = useMemo(() => {
    if (!menuData) return [];
    return menuData.categories
      .map((cat) => ({
        category: cat,
        items: filteredItems.filter((item) => item.categoryId === cat.id),
      }))
      .filter((group) => group.items.length > 0);
  }, [menuData, filteredItems]);

  // Quick add to cart handler
  const handleQuickAdd = (item: MenuItemDTO) => {
    setCart((prev) => ({
      count: prev.count + 1,
      subtotal: prev.subtotal + item.price,
    }));
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Sticky Header */}
      <div className="sticky top-0 z-40 border-b border-slate-700/50 bg-slate-900/95 backdrop-blur-md">
        {/* Top Bar */}
        <header className="flex items-center justify-between px-4 py-3 md:px-6">
          <div className="flex items-center gap-3">
            <Link
              href={`/${tenantSlug}/t/${tableCode}`}
              className="flex size-10 items-center justify-center rounded-full bg-slate-800 transition-colors hover:bg-slate-700"
            >
              <ArrowLeft className="size-5" />
            </Link>
            <div className="flex flex-col">
              <h2 className="text-lg font-bold leading-tight tracking-tight">{tenantName}</h2>
              <span className="text-xs font-medium text-slate-400">
                Table {tableNumber}
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            <LanguageToggle />
            <Link
              href={`/${tenantSlug}/t/${tableCode}/cart`}
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
        {menuData && (
          <CategoryChips
            categories={menuData.categories}
            selectedCategory={selectedCategory}
            onSelect={setSelectedCategory}
            allLabel={t.menu.all}
            language={lang}
          />
        )}

        {/* Loading state for categories */}
        {isLoading && !menuData && (
          <div className="flex gap-3 overflow-hidden px-4 pb-3 md:px-6">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-9 w-20 shrink-0 rounded-full bg-slate-800" />
            ))}
          </div>
        )}
      </div>

      {/* Content */}
      <main className="flex-1 overflow-y-auto pb-24">
        {isLoading ? (
          // Loading skeleton
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
        ) : filteredItems.length === 0 ? (
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
            {/* Chef Picks */}
            {chefPicks.length > 0 && (
              <ChefPicksCarousel
                items={chefPicks}
                tenantSlug={tenantSlug}
                tableCode={tableCode}
                language={lang}
                t={t}
              />
            )}

            {/* Menu Items by Category */}
            {groupedItems.map(({ category, items }) => (
              <section key={category.id} className="px-4 pt-6 md:px-6">
                <h3 className="sticky top-[168px] z-10 mb-4 bg-slate-900 py-2 text-lg font-bold leading-tight tracking-tight">
                  {lang === 'en' && category.nameEn ? category.nameEn : category.name}
                </h3>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {items.map((item) => (
                    <MenuItemCard
                      key={item.id}
                      item={item}
                      href={`/${tenantSlug}/t/${tableCode}/menu/${item.id}`}
                      language={lang}
                      onQuickAdd={handleQuickAdd}
                    />
                  ))}
                </div>
              </section>
            ))}
          </>
        )}
      </main>

      {/* Sticky Cart Bar */}
      <StickyCartBar
        cart={cart}
        href={`/${tenantSlug}/t/${tableCode}/cart`}
        t={t}
      />
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
