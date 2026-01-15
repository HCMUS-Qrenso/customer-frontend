"use client";

import { useState } from "react";
import { Minus, Plus, Trash2, FileEdit, X, Check } from "lucide-react";
import { CartItemDTO } from "@/lib/types/menu";
import { useLanguage } from "@/lib/i18n/context";
import { useTenantSettings } from "@/providers/tenant-settings-context";

interface CartItemCardProps {
  item: CartItemDTO;
  onUpdateQuantity: (delta: number) => void;
  onRemove: () => void;
  onUpdateNotes?: (notes: string) => void;
}

export function CartItemCard({
  item,
  onUpdateQuantity,
  onRemove,
  onUpdateNotes,
}: CartItemCardProps) {
  const { lang, t } = useLanguage();
  const { formatPrice, allowSpecialInstructions } = useTenantSettings();
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [notesValue, setNotesValue] = useState(item.notes || "");

  const name =
    lang === "en" && item.menuItemNameEn
      ? item.menuItemNameEn
      : item.menuItemName;

  // Format modifiers text
  const modifiersText = item.selectedModifiers
    .map((m) => m.modifierName)
    .join(", ");

  const handleSaveNotes = () => {
    onUpdateNotes?.(notesValue.trim());
    setIsEditingNotes(false);
  };

  const handleCancelNotes = () => {
    setNotesValue(item.notes || "");
    setIsEditingNotes(false);
  };

  const handleStartEditNotes = () => {
    setNotesValue(item.notes || "");
    setIsEditingNotes(true);
  };

  return (
    <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700/50 flex gap-4 transition-all hover:border-emerald-500/30 group">
      {/* Image */}
      {item.image && (
        <div
          className="shrink-0 w-24 h-24 rounded-lg bg-gray-100 dark:bg-slate-700 bg-cover bg-center"
          style={{ backgroundImage: `url('${item.image}')` }}
        />
      )}

      {/* Content */}
      <div className="flex flex-col grow justify-between min-w-0">
        <div>
          <div className="flex justify-between items-start gap-2">
            <h3 className="font-bold text-base leading-snug line-clamp-2 text-slate-900 dark:text-white">
              {name}
            </h3>
            <button
              onClick={onRemove}
              className="text-slate-400 hover:text-red-500 transition-colors p-1 -mr-2 -mt-1 shrink-0"
            >
              <Trash2 className="size-4" />
            </button>
          </div>
          <p className="text-emerald-500 font-semibold text-sm mt-1">
            {formatPrice(item.basePrice)}
          </p>
          {modifiersText && (
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
              {modifiersText}
            </p>
          )}

          {/* Notes Section - Only show if allow_special_instructions is enabled */}
          {allowSpecialInstructions && (
            <>
              {isEditingNotes ? (
                <div className="mt-2 space-y-2">
                  <textarea
                    value={notesValue}
                    onChange={(e) => setNotesValue(e.target.value)}
                    placeholder={
                      t.cart.notePlaceholder || "Ghi chú cho món ăn..."
                    }
                    maxLength={100}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 resize-none"
                    rows={2}
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleSaveNotes}
                      className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-full bg-emerald-500 text-white hover:bg-emerald-600 transition-colors"
                    >
                      <Check className="size-3" />
                      {t.misc?.save || "Save"}
                    </button>
                    <button
                      onClick={handleCancelNotes}
                      className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-full bg-gray-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors"
                    >
                      <X className="size-3" />
                      {t.review?.cancel || "Cancel"}
                    </button>
                  </div>
                </div>
              ) : item.notes ? (
                <button
                  onClick={handleStartEditNotes}
                  className="flex items-center gap-1 mt-2 text-xs text-slate-500 dark:text-slate-400 hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors"
                >
                  <FileEdit className="size-3.5" />
                  <span className="line-clamp-1">
                    {t.cart.note}: {item.notes}
                  </span>
                </button>
              ) : (
                <button
                  onClick={handleStartEditNotes}
                  className="flex items-center gap-1 mt-2 text-xs text-slate-400 dark:text-slate-500 hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors"
                >
                  <FileEdit className="size-3.5" />
                  <span>{t.cart.addNote}</span>
                </button>
              )}
            </>
          )}
        </div>

        {/* Quantity Stepper */}
        <div className="flex items-end justify-between mt-3">
          <div className="flex items-center bg-gray-100 dark:bg-slate-700/50 rounded-full p-1 h-9">
            <button
              onClick={() => onUpdateQuantity(-1)}
              className="w-7 h-7 flex items-center justify-center rounded-full bg-white dark:bg-slate-600 shadow-sm hover:scale-105 active:scale-95 transition-transform"
            >
              <Minus className="size-3.5 text-slate-700 dark:text-white" />
            </button>
            <span className="w-10 text-center text-sm font-semibold text-slate-900 dark:text-white">
              {item.quantity}
            </span>
            <button
              onClick={() => onUpdateQuantity(1)}
              className="w-7 h-7 flex items-center justify-center rounded-full bg-emerald-500 text-white font-bold shadow-sm hover:scale-105 active:scale-95 transition-transform"
            >
              <Plus className="size-3.5" />
            </button>
          </div>
          <span className="font-bold text-slate-900 dark:text-white">
            {formatPrice(item.totalPrice)}
          </span>
        </div>
      </div>
    </div>
  );
}
