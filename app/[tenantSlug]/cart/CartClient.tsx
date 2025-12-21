'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ShoppingCart, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LanguageProvider, useLanguage } from '@/lib/i18n/context';
import { LanguageToggle } from '@/components/LanguageToggle';
import { ThemeToggle } from '@/components/ThemeToggle';
import { CartItemDTO, MenuItemDTO } from '@/lib/types/menu';
import { formatVND } from '@/lib/format';
import { setQrToken } from '@/lib/stores/qr-token-store';
import { CartItemCard } from '@/components/cart/CartItemCard';
import { PricingSummaryCard } from '@/components/cart/PricingSummaryCard';

interface CartClientProps {
  tenantSlug: string;
  tableId?: string;
  token?: string;
}

// Mock cart data for development
const mockCartItems: CartItemDTO[] = [
  {
    menuItemId: '1',
    menuItemName: 'Phở Bò Tái',
    menuItemNameEn: 'Rare Beef Pho',
    quantity: 2,
    basePrice: 75000,
    image: 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=400',
    selectedModifiers: [
      { groupId: 'g1', groupName: 'Size', modifierId: 'm1', modifierName: 'Lớn', price: 15000 },
    ],
    notes: 'Ít hành',
    totalPrice: 180000,
  },
  {
    menuItemId: '2',
    menuItemName: 'Bánh Mì Thịt Nướng',
    menuItemNameEn: 'Grilled Pork Banh Mi',
    quantity: 1,
    basePrice: 35000,
    image: 'https://images.unsplash.com/photo-1600688640154-9619e002df30?w=400',
    selectedModifiers: [],
    totalPrice: 35000,
  },
  {
    menuItemId: '3',
    menuItemName: 'Trà Đá',
    menuItemNameEn: 'Iced Tea',
    quantity: 3,
    basePrice: 10000,
    selectedModifiers: [],
    totalPrice: 30000,
  },
];

// Mock upsell items
const mockUpsellItems: MenuItemDTO[] = [
  {
    id: 'u1',
    name: 'Chè Ba Màu',
    description: 'Three-color dessert',
    base_price: 25000,
    status: 'available',
    category: { id: 'cat1', name: 'Dessert' },
    images: [{ id: 'img1', image_url: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400', display_order: 0 }],
    created_at: '',
    updated_at: '',
  },
  {
    id: 'u2',
    name: 'Nước Ép Cam',
    description: 'Fresh orange juice',
    base_price: 35000,
    status: 'available',
    category: { id: 'cat2', name: 'Drinks' },
    images: [{ id: 'img2', image_url: 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=400', display_order: 0 }],
    created_at: '',
    updated_at: '',
  },
  {
    id: 'u3',
    name: 'Bánh Flan',
    description: 'Caramel custard',
    base_price: 20000,
    status: 'available',
    category: { id: 'cat1', name: 'Dessert' },
    images: [{ id: 'img3', image_url: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400', display_order: 0 }],
    created_at: '',
    updated_at: '',
  },
];

function CartContent({ tenantSlug, tableId, token }: CartClientProps) {
  const router = useRouter();
  const { t, lang } = useLanguage();
  const [cartItems, setCartItems] = useState<CartItemDTO[]>(mockCartItems);

  // Store QR token for API requests
  useEffect(() => {
    if (token) {
      setQrToken(token);
    }
  }, [token]);

  const menuHref = `/${tenantSlug}/menu?table=${tableId}&token=${token}`;
  const orderHref = `/${tenantSlug}/order?table=${tableId}&token=${token}`;

  const updateQuantity = (menuItemId: string, delta: number) => {
    setCartItems((prev) =>
      prev
        .map((item) =>
          item.menuItemId === menuItemId
            ? {
                ...item,
                quantity: Math.max(0, item.quantity + delta),
                totalPrice: Math.max(0, item.quantity + delta) * (item.basePrice + item.selectedModifiers.reduce((sum, m) => sum + m.price, 0)),
              }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const removeItem = (menuItemId: string) => {
    setCartItems((prev) => prev.filter((item) => item.menuItemId !== menuItemId));
  };

  const clearCart = () => {
    setCartItems([]);
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
        {/* Header */}
        <header className="sticky top-0 z-40 border-b border-gray-200 dark:border-slate-700/50 bg-gray-50/95 dark:bg-slate-900/95 backdrop-blur-md">
          <div className="flex items-center justify-between px-4 py-3 md:px-6">
            <div className="flex items-center gap-3">
              <Link
                href={menuHref}
                className="flex size-10 items-center justify-center rounded-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-transparent transition-colors hover:bg-gray-100 dark:hover:bg-slate-700"
              >
                <ArrowLeft className="size-5" />
              </Link>
              <h1 className="text-lg font-bold tracking-tight">{t.cart.title}</h1>
            </div>
            <div className="flex gap-2">
              <ThemeToggle />
              <LanguageToggle />
            </div>
          </div>
        </header>

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
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-gray-200 dark:border-slate-700/50 bg-gray-50/95 dark:bg-slate-900/95 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href={menuHref}
              className="flex size-10 items-center justify-center rounded-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-transparent transition-colors hover:bg-gray-100 dark:hover:bg-slate-700"
            >
              <ArrowLeft className="size-5" />
            </Link>
            <h1 className="text-lg font-bold tracking-tight">{t.cart.title}</h1>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <LanguageToggle />
            <button
              onClick={clearCart}
              className="px-3 h-9 flex items-center justify-center gap-1.5 rounded-full text-sm font-medium text-red-500 hover:bg-red-500/10 transition-colors"
            >
              <Trash2 className="size-4" />
              <span className="hidden sm:inline">{t.cart.clearAll}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow w-full max-w-6xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-12 gap-8 pb-32 lg:pb-6">
        {/* Left: Cart Items */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <div className="flex flex-col gap-4">
            {cartItems.map((item) => (
              <CartItemCard
                key={item.menuItemId}
                item={item}
                onUpdateQuantity={(delta) => updateQuantity(item.menuItemId, delta)}
                onRemove={() => removeItem(item.menuItemId)}
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
                      style={{ backgroundImage: `url('${item.images[0]?.image_url}')` }}
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
            onPlaceOrder={() => router.push(orderHref)}
          />
        </div>
      </main>

      {/* Mobile Sticky Bottom Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-slate-700/50 p-4 pb-[calc(env(safe-area-inset-bottom,16px)+16px)] shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
        <div className="max-w-6xl mx-auto flex gap-4 items-center">
          <div className="flex flex-col flex-1">
            <span className="text-xs text-slate-500 dark:text-slate-400">{t.cart.total}</span>
            <span className="text-xl font-bold text-emerald-500">
              {formatVND(calculations.total)}
            </span>
          </div>
          <Button
            onClick={() => router.push(orderHref)}
            className="flex-[2] h-12 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-full text-base flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all"
          >
            <span>{t.cart.placeOrder}</span>
          </Button>
        </div>
      </div>
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
