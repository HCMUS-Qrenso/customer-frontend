"use client";

import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import Link from "next/link";
import {
  Minus,
  Plus,
  Clock,
  Flame,
  AlertTriangle,
  ShoppingCart,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/shared/PageHeader";
import { LiveIndicator } from "@/components/shared/LiveIndicator";
import { ImageCarousel } from "@/components/shared/ImageCarousel";
import { NutritionalInfo } from "@/components/menu/NutritionalInfo";
import { LanguageProvider, useLanguage } from "@/lib/i18n/context";
import { ModifierGroup } from "@/components/menu/ModifierGroup";
import { formatVND } from "@/lib/format";
import { customerHref } from "@/lib/customer/context";
import { useMenuItemQuery } from "@/hooks/use-menu-query";
import { setQrToken, setTableId } from "@/lib/stores/qr-token-store";
import { useCartStore } from "@/lib/stores/cart-store";
import { toast } from "sonner";
import type { ModifierGroupDTO, CartItemDTO } from "@/lib/types/menu";

interface ItemDetailClientProps {
  tenantSlug: string;
  itemId: string;
  ctx: { table: string; token: string };
}

function ItemDetailContent({ tenantSlug, itemId, ctx }: ItemDetailClientProps) {
  const { t, lang } = useLanguage();

  const [quantity, setQuantity] = useState(1);
  const [selectedModifiers, setSelectedModifiers] = useState<
    Record<string, string[]>
  >({});
  const [notes, setNotes] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  // Cart state from Zustand store (shared across all pages)
  const addToCart = useCartStore((state) => state.addItem);
  const cartItemCount = useCartStore((state) => state.getItemCount());

  // Store QR token and tableId to sessionStorage for navigation
  useEffect(() => {
    if (ctx.token) setQrToken(ctx.token);
    if (ctx.table) setTableId(ctx.table);
  }, [ctx.token, ctx.table]);

  // Fetch menu item detail
  const { data: item, isLoading, error } = useMenuItemQuery(itemId);

  const handleModifierChange = (
    groupId: string,
    optionId: string,
    group: ModifierGroupDTO,
  ) => {
    setSelectedModifiers((prev) => {
      if (group.type === "single_choice") {
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
    let total =
      typeof item.base_price === "string"
        ? parseInt(item.base_price, 10)
        : item.base_price;

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
      .every(
        (group) =>
          (selectedModifiers[group.id]?.length || 0) >= group.min_selections,
      );
  }, [item, selectedModifiers]);

  // Handle add to cart with toast notification
  const handleAddToCart = useCallback(() => {
    if (!item || !isValid || isAdding) return;

    setIsAdding(true);

    // Build selected modifiers for CartItemDTO
    const cartModifiers: CartItemDTO["selectedModifiers"] = [];
    item.modifier_groups?.forEach((group) => {
      const selected = selectedModifiers[group.id] || [];
      selected.forEach((modifierId) => {
        const modifier = group.modifiers.find((m) => m.id === modifierId);
        if (modifier) {
          cartModifiers.push({
            groupId: group.id,
            groupName: group.name,
            modifierId: modifier.id,
            modifierName: modifier.name,
            price: parseInt(modifier.price_adjustment, 10) || 0,
          });
        }
      });
    });

    const cartItem: CartItemDTO = {
      menuItemId: item.id,
      menuItemName: item.name,
      quantity,
      basePrice: typeof item.base_price === "string"
        ? parseInt(item.base_price, 10)
        : item.base_price,
      image: item.images?.[0]?.image_url,
      selectedModifiers: cartModifiers,
      notes: notes || undefined,
      totalPrice: totalPrice,
    };

    addToCart(cartItem);

    // Show success toast
    toast.success(`Đã thêm ${item.name} vào giỏ hàng`, {
      description: `${quantity} x ${formatVND(totalPrice)}`,
      duration: 2000,
    });

    // Reset form after adding
    setQuantity(1);
    setSelectedModifiers({});
    setNotes("");
    setIsAdding(false);
  }, [item, isValid, isAdding, quantity, selectedModifiers, notes, totalPrice, addToCart]);

  const menuHref = customerHref(tenantSlug, "menu", ctx);
  const cartHref = customerHref(tenantSlug, "cart", ctx);

  // Error state
  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 dark:bg-slate-900 px-6 text-center transition-colors">
        <div className="mb-6 flex size-20 items-center justify-center rounded-full bg-red-500/10">
          <AlertTriangle className="size-10 text-red-500" />
        </div>
        <h1 className="mb-2 text-2xl font-bold text-slate-900 dark:text-white">
          Không tìm thấy món
        </h1>
        <p className="mb-8 max-w-sm text-slate-500 dark:text-slate-400">
          Món ăn này không tồn tại hoặc đã bị xóa.
        </p>
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
      <PageHeader
        title={t.menu.itemDetail}
        backHref={menuHref}
        rightContent={
          <Link
            href={cartHref}
            className="relative flex size-10 items-center justify-center rounded-full transition-colors hover:bg-gray-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200"
          >
            <ShoppingCart className="size-5" />
            {cartItemCount > 0 && (
              <LiveIndicator size="sm" className="absolute right-1 top-1" />
            )}
          </Link>
        }
      />

      {/* Main Content */}
      <main className="mx-auto w-full max-w-7xl p-4 pb-40 lg:p-8 lg:pb-40">
        {isLoading ? (
          // Loading skeleton
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:gap-12">
            <div className="flex flex-col gap-6">
              <Skeleton className="aspect-4/3 w-full rounded-xl bg-gray-200 dark:bg-slate-800 md:aspect-square" />
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
                  <h2 className="text-2xl font-bold leading-tight text-slate-900 dark:text-white md:text-3xl">
                    {item.name}
                  </h2>
                  <div className="flex flex-col items-end">
                    <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400 md:text-2xl">
                      {formatVND(item.base_price)}
                    </span>
                    {item.status === "available" && (
                      <span className="mt-1 rounded-full bg-green-500/10 px-2 py-0.5 text-xs font-medium text-green-600 dark:text-green-500">
                        Còn hàng
                      </span>
                    )}
                    {item.status === "sold_out" && (
                      <span className="mt-1 rounded-full bg-red-500/10 px-2 py-0.5 text-xs font-medium text-red-600 dark:text-red-500">
                        Hết hàng
                      </span>
                    )}
                    {item.status === "unavailable" && (
                      <span className="mt-1 rounded-full bg-orange-500/10 px-2 py-0.5 text-xs font-medium text-orange-600 dark:text-orange-500">
                        Hết món
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
                      <span className="text-xs font-medium">
                        {item.preparation_time} phút
                      </span>
                    </div>
                  )}

                  {/* Category */}
                  {item.category?.name && (
                    <div className="flex h-8 items-center gap-2 rounded-full bg-purple-500/10 px-3 text-purple-600 dark:text-purple-400">
                      <span className="text-xs font-medium">
                        {item.category.name}
                      </span>
                    </div>
                  )}

                  {/* Popularity Score */}
                  {item.popularity_score && item.popularity_score > 0 && (
                    <div className="flex h-8 items-center gap-2 rounded-full bg-amber-500/10 px-3 text-amber-600 dark:text-amber-400">
                      <Flame className="size-4" />
                      <span className="text-xs font-medium">
                        {item.popularity_score}% yêu thích
                      </span>
                    </div>
                  )}
                </div>

                {/* Allergen Info - Always visible */}
                {item.allergen_info && (
                  <div className="flex items-start gap-2 rounded-lg bg-amber-500/10 p-3 text-amber-700 dark:text-amber-400">
                    <AlertTriangle className="size-4 shrink-0 mt-0.5" />
                    <span className="text-xs font-medium">
                      {item.allergen_info}
                    </span>
                  </div>
                )}

                {/* Nutritional Info - Collapsible */}
                <NutritionalInfo nutritionalInfo={item.nutritional_info} />
              </div>
            </div>

            {/* Right: Modifiers & Notes */}
            <div className="flex flex-col gap-4 md:pb-24">
              {item.modifier_groups?.map((group) => (
                <ModifierGroup
                  key={group.id}
                  group={group}
                  selectedOptions={selectedModifiers[group.id] || []}
                  onChange={(optionId) =>
                    handleModifierChange(group.id, optionId, group)
                  }
                  language={lang}
                />
              ))}

              {/* Notes */}
              <div className="rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4">
                <h3 className="mb-3 text-lg font-bold text-slate-900 dark:text-white">
                  {t.menu.noteForKitchen}
                </h3>
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
                <span className="w-8 text-center text-lg font-bold text-slate-900 dark:text-white">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="flex size-10 items-center justify-center rounded-full bg-emerald-500 text-white transition hover:bg-emerald-400"
                >
                  <Plus className="size-5" />
                </button>
              </div>

              {/* Mobile Price */}
              <div className="flex flex-col items-end md:hidden">
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {t.menu.subtotal}
                </span>
                <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                  {formatVND(totalPrice)}
                </span>
              </div>
            </div>

            {/* Add to Cart Button */}
            <Button
              onClick={handleAddToCart}
              disabled={
                !isValid ||
                isAdding ||
                item.status === "unavailable" ||
                item.status === "sold_out"
              }
              className={`
                flex h-12 w-full items-center justify-between rounded-full px-6 font-bold shadow-lg transition-all active:scale-[0.98] md:h-14 md:min-w-[320px] md:w-auto
                ${
                  !isValid ||
                  item.status === "unavailable" ||
                  item.status === "sold_out"
                    ? "bg-gray-200 dark:bg-slate-700 text-slate-400 cursor-not-allowed"
                    : "bg-emerald-500 text-white hover:bg-emerald-600 dark:hover:bg-emerald-400 shadow-emerald-500/20"
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
