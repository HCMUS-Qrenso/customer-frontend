'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ShoppingCart, Minus, Plus, Clock, Flame, AlertTriangle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { LanguageProvider, useLanguage } from '@/lib/i18n/context';
import { LanguageToggle } from '@/components/LanguageToggle';
import { ModifierGroup } from '@/components/menu/ModifierGroup';
import { formatVND } from '@/lib/format';
import { customerHref } from '@/lib/customer/context';
import { useMenuItemQuery } from '@/hooks/use-menu-query';
import type { MenuItemDetailDTO, ModifierGroupDTO, Language, CartSummaryDTO } from '@/lib/types/menu';

interface ItemDetailClientProps {
  tenantSlug: string;
  itemId: string;
  ctx: { table: string; token: string };
}

function ItemDetailContent({ tenantSlug, itemId, ctx }: ItemDetailClientProps) {
  const { t, lang } = useLanguage();
  const router = useRouter();
  
  const [quantity, setQuantity] = useState(1);
  const [selectedModifiers, setSelectedModifiers] = useState<Record<string, string[]>>({});
  const [notes, setNotes] = useState('');
  
  // Mock cart state (would be from context/store in production)
  const [cart] = useState<CartSummaryDTO>({ count: 2, subtotal: 178000 });

  // Fetch menu item detail
  const { data: item, isLoading, error } = useMenuItemQuery(itemId);

  const handleModifierChange = (groupId: string, optionId: string, group: ModifierGroupDTO) => {
    setSelectedModifiers((prev) => {
      if (group.type === 'single_choice') {
        // Radio - replace selection
        return { ...prev, [groupId]: [optionId] };
      }
      // Checkbox - toggle selection
      const current = prev[groupId] || [];
      if (current.includes(optionId)) {
        return { ...prev, [groupId]: current.filter((id) => id !== optionId) };
      }
      // Check max selections
      if (group.max_selections && current.length >= group.max_selections) {
        return prev;
      }
      return { ...prev, [groupId]: [...current, optionId] };
    });
  };

  // Calculate total price
  const totalPrice = useMemo(() => {
    if (!item) return 0;
    let total = item.base_price;
    
    item.modifier_groups?.forEach((group) => {
      const selected = selectedModifiers[group.id] || [];
      selected.forEach((modifierId) => {
        const modifier = group.modifiers.find((m) => m.id === modifierId);
        if (modifier) total += modifier.price;
      });
    });
    
    return total * quantity;
  }, [item, selectedModifiers, quantity]);

  // Check if required modifiers are selected
  const isValid = useMemo(() => {
    if (!item?.modifier_groups) return true;
    return item.modifier_groups
      .filter((g) => g.is_required)
      .every((group) => (selectedModifiers[group.id]?.length || 0) >= group.min_selections);
  }, [item, selectedModifiers]);

  const menuHref = customerHref(tenantSlug, 'menu', ctx);
  const cartHref = customerHref(tenantSlug, 'cart', ctx);

  // Error state
  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-900 px-6 text-center text-white">
        <div className="mb-6 flex size-20 items-center justify-center rounded-full bg-red-500/10">
          <AlertTriangle className="size-10 text-red-500" />
        </div>
        <h1 className="mb-2 text-2xl font-bold">Không tìm thấy món</h1>
        <p className="mb-8 max-w-sm text-slate-400">Món ăn này không tồn tại hoặc đã bị xóa.</p>
        <Link href={menuHref}>
          <Button className="gap-2 bg-emerald-500 text-white hover:bg-emerald-600">
            <ArrowLeft className="size-4" />
            Quay lại menu
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 flex h-[60px] items-center justify-between border-b border-slate-700 bg-slate-900/95 px-4 backdrop-blur-md">
        <button
          onClick={() => router.push(menuHref)}
          className="flex size-10 items-center justify-center rounded-full transition-colors hover:bg-slate-800"
        >
          <ArrowLeft className="size-5" />
        </button>
        <h1 className="truncate px-2 text-base font-bold sm:text-lg">
          {t.menu.itemDetail}
        </h1>
        <Link
          href={cartHref}
          className="relative flex size-10 items-center justify-center rounded-full transition-colors hover:bg-slate-800"
        >
          <ShoppingCart className="size-5" />
          {cart.count > 0 && (
            <span className="absolute right-0 top-1 flex size-4 items-center justify-center rounded-full bg-emerald-500 text-[10px] font-bold text-black">
              {cart.count}
            </span>
          )}
        </Link>
      </header>

      {/* Main Content */}
      <main className="mx-auto w-full max-w-7xl p-4 pb-32 lg:p-8">
        {isLoading ? (
          // Loading skeleton
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:gap-12">
            <div className="flex flex-col gap-6">
              <Skeleton className="aspect-[4/3] w-full rounded-xl bg-slate-800 md:aspect-square" />
              <Skeleton className="h-8 w-3/4 bg-slate-800" />
              <Skeleton className="h-20 w-full bg-slate-800" />
            </div>
            <div className="flex flex-col gap-4">
              <Skeleton className="h-40 w-full rounded-xl bg-slate-800" />
              <Skeleton className="h-40 w-full rounded-xl bg-slate-800" />
            </div>
          </div>
        ) : item ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:gap-12">
            {/* Left: Image & Info */}
            <div className="flex flex-col gap-6 md:sticky md:top-[84px] md:h-[calc(100vh-100px)] md:overflow-y-auto">
              {/* Hero Image */}
              <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-slate-800 shadow-lg md:aspect-square">
                <div
                  className="size-full bg-cover bg-center transition-transform duration-700 hover:scale-105"
                  style={{ backgroundImage: `url('${item.images[0] || '/placeholder-food.jpg'}')` }}
                />
                {item.badges?.map((badge) => (
                  <div key={badge} className="absolute left-4 top-4">
                    <span className="rounded-full bg-emerald-500 px-3 py-1.5 text-xs font-bold text-black shadow-sm">
                      {badge}
                    </span>
                  </div>
                ))}
              </div>

              {/* Basic Info */}
              <div className="flex flex-col gap-4">
                <div className="flex items-start justify-between gap-4">
                  <h2 className="text-2xl font-bold leading-tight md:text-3xl">{item.name}</h2>
                  <div className="flex flex-col items-end">
                    <span className="text-xl font-bold text-emerald-400 md:text-2xl">
                      {formatVND(item.base_price)}
                    </span>
                    {item.status === 'active' && (
                      <span className="mt-1 rounded-full bg-green-500/10 px-2 py-0.5 text-xs font-medium text-green-500">
                        Còn hàng
                      </span>
                    )}
                  </div>
                </div>
                
                {item.description && (
                  <p className="text-sm leading-relaxed text-slate-400 md:text-base">
                    {item.description}
                  </p>
                )}

                {/* Meta Chips */}
                <div className="flex flex-wrap gap-3">
                  {item.prep_time && (
                    <div className="flex h-8 items-center gap-2 rounded-full bg-slate-800 px-3">
                      <Clock className="size-4" />
                      <span className="text-xs font-medium">{item.prep_time}</span>
                    </div>
                  )}
                  {item.calories && (
                    <div className="flex h-8 items-center gap-2 rounded-full bg-slate-800 px-3">
                      <Flame className="size-4" />
                      <span className="text-xs font-medium">{item.calories}</span>
                    </div>
                  )}
                  {item.allergens?.map((allergen) => (
                    <div
                      key={allergen}
                      className="flex h-8 items-center gap-2 rounded-full bg-amber-500/10 px-3 text-amber-400"
                    >
                      <AlertTriangle className="size-4" />
                      <span className="text-xs font-medium">{allergen}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Modifiers & Notes */}
            <div className="flex flex-col gap-4 md:pb-24">
              {item.modifier_groups?.map((group) => (
                <ModifierGroup
                  key={group.id}
                  group={group}
                  selectedOptions={selectedModifiers[group.id] || []}
                  onChange={(optionId) => handleModifierChange(group.id, optionId, group)}
                  language={lang}
                />
              ))}

              {/* Notes */}
              <div className="rounded-xl border border-slate-700 bg-slate-800 p-4">
                <h3 className="mb-3 text-lg font-bold">{t.menu.noteForKitchen}</h3>
                <div className="relative">
                  <textarea
                    className="w-full resize-none rounded-lg border border-slate-700 bg-slate-900 p-3 text-sm text-white placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    placeholder={t.menu.notePlaceholder}
                    rows={3}
                    maxLength={100}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                  <div className="absolute bottom-2 right-2 text-[10px] text-slate-500">
                    {notes.length}/100
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </main>

      {/* Sticky Footer */}
      {item && (
        <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-slate-700 bg-slate-900/95 px-4 py-3 backdrop-blur-md md:px-8 md:py-4">
          <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 md:flex-row">
            {/* Quantity Stepper */}
            <div className="flex w-full items-center justify-between gap-6 md:w-auto">
              <div className="flex items-center rounded-full border border-slate-700 bg-slate-800 p-1">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                  className="flex size-10 items-center justify-center rounded-full bg-slate-700 transition hover:bg-slate-600 disabled:opacity-50"
                >
                  <Minus className="size-5" />
                </button>
                <span className="w-8 text-center text-lg font-bold">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="flex size-10 items-center justify-center rounded-full bg-emerald-500 text-black transition hover:bg-emerald-400"
                >
                  <Plus className="size-5" />
                </button>
              </div>

              {/* Mobile Price */}
              <div className="flex flex-col items-end md:hidden">
                <span className="text-xs text-slate-400">{t.menu.subtotal}</span>
                <span className="text-lg font-bold text-emerald-400">{formatVND(totalPrice)}</span>
              </div>
            </div>

            {/* Add to Cart Button */}
            <Button
              disabled={!isValid || item.status === 'inactive'}
              className={`
                flex h-12 w-full items-center justify-between rounded-full px-6 font-bold shadow-lg transition-transform active:scale-[0.98] md:h-14 md:min-w-[320px] md:w-auto
                ${!isValid || item.status === 'inactive'
                  ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                  : 'bg-emerald-500 text-black hover:bg-emerald-400 shadow-emerald-500/20'
                }
              `}
            >
              <span className="text-sm md:text-base">{t.menu.addToCart}</span>
              <span className="hidden border-l border-black/10 pl-4 md:block">
                {formatVND(totalPrice)}
              </span>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export function ItemDetailClient(props: ItemDetailClientProps) {
  return (
    <LanguageProvider>
      <ItemDetailContent {...props} />
    </LanguageProvider>
  );
}
