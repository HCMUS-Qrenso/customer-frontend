'use client';

import { useState, useMemo, useCallback, useRef } from 'react';
import Link from 'next/link';
import { Minus, Plus, Clock, Flame, AlertTriangle, ImageIcon, Info, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { CustomerHeader } from '@/components/CustomerHeader';
import { LanguageProvider, useLanguage } from '@/lib/i18n/context';
import { ModifierGroup } from '@/components/menu/ModifierGroup';
import { formatVND } from '@/lib/format';
import { customerHref } from '@/lib/customer/context';
import { useMenuItemQuery } from '@/hooks/use-menu-query';
import type { ModifierGroupDTO, CartSummaryDTO } from '@/lib/types/menu';

// Image Carousel Component with swipe support and slide animation
interface ImageCarouselProps {
  images: Array<{ id: string; image_url: string; display_order: number }>;
  alt: string;
  badges?: string[];
}

function ImageCarousel({ images, alt, badges }: ImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Sort by display_order and extract URLs
  const sortedImages = useMemo(() => 
    [...(images || [])].sort((a, b) => a.display_order - b.display_order),
    [images]
  );
  const imageUrls = sortedImages.map(img => img.image_url);
  const hasImages = imageUrls.length > 0;
  const showDots = hasImages && imageUrls.length > 1;

  const goToIndex = useCallback((index: number) => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentIndex(index);
    setTimeout(() => setIsAnimating(false), 300);
  }, [isAnimating]);

  // Swipe handlers
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (isAnimating) return;
    touchStartX.current = e.touches[0].clientX;
  }, [isAnimating]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const diff = e.touches[0].clientX - touchStartX.current;
    setSwipeOffset(diff);
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (touchStartX.current === null) return;
    
    const minSwipeDistance = 50;

    if (Math.abs(swipeOffset) > minSwipeDistance) {
      if (swipeOffset < 0) {
        // Swipe left - go to next
        goToIndex(currentIndex === imageUrls.length - 1 ? 0 : currentIndex + 1);
      } else {
        // Swipe right - go to previous
        goToIndex(currentIndex === 0 ? imageUrls.length - 1 : currentIndex - 1);
      }
    }

    touchStartX.current = null;
    setSwipeOffset(0);
  }, [swipeOffset, currentIndex, imageUrls.length, goToIndex]);

  // Mouse drag support for desktop
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (isAnimating) return;
    touchStartX.current = e.clientX;
  }, [isAnimating]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (touchStartX.current === null) return;
    const diff = e.clientX - touchStartX.current;
    setSwipeOffset(diff);
  }, []);

  const handleMouseUp = useCallback(() => {
    if (touchStartX.current === null) return;
    
    const minSwipeDistance = 50;

    if (Math.abs(swipeOffset) > minSwipeDistance) {
      if (swipeOffset < 0) {
        goToIndex(currentIndex === imageUrls.length - 1 ? 0 : currentIndex + 1);
      } else {
        goToIndex(currentIndex === 0 ? imageUrls.length - 1 : currentIndex - 1);
      }
    }

    touchStartX.current = null;
    setSwipeOffset(0);
  }, [swipeOffset, currentIndex, imageUrls.length, goToIndex]);

  const handleMouseLeave = useCallback(() => {
    touchStartX.current = null;
    setSwipeOffset(0);
  }, []);

  return (
    <div 
      ref={containerRef}
      className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-gray-100 dark:bg-slate-800 shadow-lg md:aspect-square select-none cursor-grab active:cursor-grabbing"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
    >
      {/* Image Slider */}
      {hasImages ? (
        <div 
          className="flex size-full transition-transform duration-300 ease-out"
          style={{ 
            transform: `translateX(calc(-${currentIndex * 100}% + ${swipeOffset}px))`,
            transitionDuration: swipeOffset !== 0 ? '0ms' : '300ms'
          }}
        >
          {imageUrls.map((url, index) => (
            <div
              key={index}
              className="size-full shrink-0 bg-cover bg-center pointer-events-none"
              style={{ backgroundImage: `url('${url}')` }}
            />
          ))}
        </div>
      ) : (
        <div className="flex size-full flex-col items-center justify-center gap-3 text-gray-300 dark:text-slate-600">
          <ImageIcon className="size-20" strokeWidth={1} />
          <span className="text-sm font-medium text-gray-400 dark:text-slate-500">Không có hình ảnh</span>
        </div>
      )}

      {/* Dot Indicators - Clickable */}
      {showDots && (
        <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
          {imageUrls.map((_, index) => (
            <button
              key={index}
              onClick={() => goToIndex(index)}
              className={`size-2.5 rounded-full transition-all duration-200 ${
                index === currentIndex
                  ? 'bg-white scale-125 shadow-lg'
                  : 'bg-white/50 hover:bg-white/70'
              }`}
            />
          ))}
        </div>
      )}

      {/* Badges */}
      {badges?.map((badge) => (
        <div key={badge} className="absolute left-4 top-4 pointer-events-none">
          <span className="rounded-full bg-emerald-500 px-3 py-1.5 text-xs font-bold text-white shadow-sm">
            {badge}
          </span>
        </div>
      ))}
    </div>
  );
}

// Nutritional Info Accordion Component
interface NutritionalInfoAccordionProps {
  nutritionalInfo?: {
    calories?: number;
    protein?: number;
    carbs?: number;
    fat?: number;
  };
}

function NutritionalInfoAccordion({ nutritionalInfo }: NutritionalInfoAccordionProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Don't render if no nutritional info
  if (!nutritionalInfo) return null;
  
  const hasAnyInfo = nutritionalInfo.calories || nutritionalInfo.protein || 
                     nutritionalInfo.carbs || nutritionalInfo.fat;
  
  if (!hasAnyInfo) return null;

  return (
    <div className="rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 overflow-hidden">
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between p-3 text-left transition-colors hover:bg-gray-50 dark:hover:bg-slate-700"
      >
        <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
          <Info className="size-4" />
          <span className="text-sm font-medium">Thông tin dinh dưỡng</span>
        </div>
        <ChevronDown className={`size-5 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Content */}
      <div className={`overflow-hidden transition-all duration-200 ${isOpen ? 'max-h-40' : 'max-h-0'}`}>
        <div className="flex flex-wrap gap-2 p-3">
          {nutritionalInfo.calories && (
            <div className="flex h-7 items-center gap-1.5 rounded-full bg-orange-500/10 px-3 text-orange-600 dark:text-orange-400">
              <span className="text-xs font-bold">{nutritionalInfo.calories}</span>
              <span className="text-xs">kcal</span>
            </div>
          )}
          {nutritionalInfo.protein && (
            <div className="flex h-7 items-center gap-1.5 rounded-full bg-red-500/10 px-3 text-red-600 dark:text-red-400">
              <span className="text-xs font-bold">{nutritionalInfo.protein}g</span>
              <span className="text-xs">protein</span>
            </div>
          )}
          {nutritionalInfo.carbs && (
            <div className="flex h-7 items-center gap-1.5 rounded-full bg-blue-500/10 px-3 text-blue-600 dark:text-blue-400">
              <span className="text-xs font-bold">{nutritionalInfo.carbs}g</span>
              <span className="text-xs">carbs</span>
            </div>
          )}
          {nutritionalInfo.fat && (
            <div className="flex h-7 items-center gap-1.5 rounded-full bg-yellow-500/10 px-3 text-yellow-600 dark:text-yellow-400">
              <span className="text-xs font-bold">{nutritionalInfo.fat}g</span>
              <span className="text-xs">fat</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface ItemDetailClientProps {
  tenantSlug: string;
  itemId: string;
  ctx: { table: string; token: string };
}

function ItemDetailContent({ tenantSlug, itemId, ctx }: ItemDetailClientProps) {
  const { t, lang } = useLanguage();
  
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
        return { ...prev, [groupId]: [optionId] };
      }
      const current = prev[groupId] || [];
      if (current.includes(optionId)) {
        return { ...prev, [groupId]: current.filter((id) => id !== optionId) };
      }
      if (group.max_selections && current.length >= group.max_selections) {
        return prev;
      }
      return { ...prev, [groupId]: [...current, optionId] };
    });
  };

  // Calculate total price
  const totalPrice = useMemo(() => {
    if (!item) return 0;
    let total = typeof item.base_price === 'string' ? parseInt(item.base_price, 10) : item.base_price;
    
    item.modifier_groups?.forEach((group) => {
      const selected = selectedModifiers[group.id] || [];
      selected.forEach((modifierId) => {
        const modifier = group.modifiers.find((m) => m.id === modifierId);
        if (modifier) {
          const priceAdjustment = parseInt(modifier.price_adjustment, 10) || 0;
          total += priceAdjustment;
        }
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
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 dark:bg-slate-900 px-6 text-center transition-colors">
        <div className="mb-6 flex size-20 items-center justify-center rounded-full bg-red-500/10">
          <AlertTriangle className="size-10 text-red-500" />
        </div>
        <h1 className="mb-2 text-2xl font-bold text-slate-900 dark:text-white">Không tìm thấy món</h1>
        <p className="mb-8 max-w-sm text-slate-500 dark:text-slate-400">Món ăn này không tồn tại hoặc đã bị xóa.</p>
        <Link href={menuHref}>
          <Button className="gap-2 bg-emerald-500 text-white hover:bg-emerald-600">
            Quay lại menu
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 text-slate-900 dark:text-white transition-colors">
      {/* Header */}
      <CustomerHeader
        title={t.menu.itemDetail}
        backHref={menuHref}
        cartHref={cartHref}
        cartCount={cart.count}
        showCart={true}
      />

      {/* Main Content */}
      <main className="mx-auto w-full max-w-7xl p-4 pb-40 lg:p-8 lg:pb-40">
        {isLoading ? (
          // Loading skeleton
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:gap-12">
            <div className="flex flex-col gap-6">
              <Skeleton className="aspect-[4/3] w-full rounded-xl bg-gray-200 dark:bg-slate-800 md:aspect-square" />
              <Skeleton className="h-8 w-3/4 bg-gray-200 dark:bg-slate-800" />
              <Skeleton className="h-20 w-full bg-gray-200 dark:bg-slate-800" />
            </div>
            <div className="flex flex-col gap-4">
              <Skeleton className="h-40 w-full rounded-xl bg-gray-200 dark:bg-slate-800" />
              <Skeleton className="h-40 w-full rounded-xl bg-gray-200 dark:bg-slate-800" />
            </div>
          </div>
        ) : item ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:gap-12">
            {/* Left: Image & Info */}
            <div className="flex flex-col gap-6 pb-8 lg:pb-16">
              {/* Hero Image Carousel */}
              <ImageCarousel 
                images={item.images} 
                alt={item.name}
                badges={item.badges}
              />

              {/* Basic Info */}
              <div className="flex flex-col gap-4">
                <div className="flex items-start justify-between gap-4">
                  <h2 className="text-2xl font-bold leading-tight text-slate-900 dark:text-white md:text-3xl">{item.name}</h2>
                  <div className="flex flex-col items-end">
                    <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400 md:text-2xl">
                      {formatVND(item.base_price)}
                    </span>
                    {item.status === 'available' && (
                      <span className="mt-1 rounded-full bg-green-500/10 px-2 py-0.5 text-xs font-medium text-green-600 dark:text-green-500">
                        Còn hàng
                      </span>
                    )}
                  </div>
                </div>
                
                {item.description && (
                  <p className="text-sm leading-relaxed text-slate-500 dark:text-slate-400 md:text-base">
                    {item.description}
                  </p>
                )}

                {/* Meta Chips */}
                <div className="flex flex-wrap gap-2">
                  {/* Prep Time */}
                  {item.preparation_time && (
                    <div className="flex h-8 items-center gap-2 rounded-full bg-gray-100 dark:bg-slate-800 px-3 text-slate-700 dark:text-slate-300">
                      <Clock className="size-4" />
                      <span className="text-xs font-medium">{item.preparation_time} phút</span>
                    </div>
                  )}
                  
                  {/* Category */}
                  {item.category?.name && (
                    <div className="flex h-8 items-center gap-2 rounded-full bg-purple-500/10 px-3 text-purple-600 dark:text-purple-400">
                      <span className="text-xs font-medium">{item.category.name}</span>
                    </div>
                  )}
                  
                  {/* Popularity Score */}
                  {item.popularity_score && item.popularity_score > 0 && (
                    <div className="flex h-8 items-center gap-2 rounded-full bg-amber-500/10 px-3 text-amber-600 dark:text-amber-400">
                      <Flame className="size-4" />
                      <span className="text-xs font-medium">{item.popularity_score}% yêu thích</span>
                    </div>
                  )}
                </div>

                {/* Allergen Info - Always visible */}
                {item.allergen_info && (
                  <div className="flex items-start gap-2 rounded-lg bg-amber-500/10 p-3 text-amber-700 dark:text-amber-400">
                    <AlertTriangle className="size-4 shrink-0 mt-0.5" />
                    <span className="text-xs font-medium">{item.allergen_info}</span>
                  </div>
                )}

                {/* Nutritional Info - Collapsible */}
                <NutritionalInfoAccordion nutritionalInfo={item.nutritional_info} />
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
              <div className="rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4">
                <h3 className="mb-3 text-lg font-bold text-slate-900 dark:text-white">{t.menu.noteForKitchen}</h3>
                <div className="relative">
                  <textarea
                    className="w-full resize-none rounded-lg border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900 p-3 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    placeholder={t.menu.notePlaceholder}
                    rows={3}
                    maxLength={100}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                  <div className="absolute bottom-2 right-2 text-[10px] text-slate-400 dark:text-slate-500">
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
        <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-gray-200 dark:border-slate-700 bg-white/95 dark:bg-slate-900/95 px-4 py-3 backdrop-blur-md md:px-8 md:py-4">
          <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 md:flex-row">
            {/* Quantity Stepper */}
            <div className="flex w-full items-center justify-between gap-6 md:w-auto">
              <div className="flex items-center rounded-full border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 p-1">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                  className="flex size-10 items-center justify-center rounded-full bg-white dark:bg-slate-700 transition hover:bg-gray-100 dark:hover:bg-slate-600 disabled:opacity-50 text-slate-700 dark:text-slate-200"
                >
                  <Minus className="size-5" />
                </button>
                <span className="w-8 text-center text-lg font-bold text-slate-900 dark:text-white">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="flex size-10 items-center justify-center rounded-full bg-emerald-500 text-white transition hover:bg-emerald-400"
                >
                  <Plus className="size-5" />
                </button>
              </div>

              {/* Mobile Price */}
              <div className="flex flex-col items-end md:hidden">
                <span className="text-xs text-slate-500 dark:text-slate-400">{t.menu.subtotal}</span>
                <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">{formatVND(totalPrice)}</span>
              </div>
            </div>

            {/* Add to Cart Button */}
            <Button
              disabled={!isValid || item.status === 'unavailable'}
              className={`
                flex h-12 w-full items-center justify-between rounded-full px-6 font-bold shadow-lg transition-all active:scale-[0.98] md:h-14 md:min-w-[320px] md:w-auto
                ${!isValid || item.status === 'unavailable'
                  ? 'bg-gray-200 dark:bg-slate-700 text-slate-400 cursor-not-allowed'
                  : 'bg-emerald-500 text-white hover:bg-emerald-600 dark:hover:bg-emerald-400 shadow-emerald-500/20'
                }
              `}
            >
              <span className="text-sm md:text-base">{t.menu.addToCart}</span>
              <span className="hidden border-l border-emerald-950/10 pl-4 md:block">
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
