'use client';

import { Minus, Plus, Trash2, FileEdit } from 'lucide-react';
import { CartItemDTO } from '@/lib/types/menu';
import { useLanguage } from '@/lib/i18n/context';
import { formatVND } from '@/lib/format';

interface CartItemCardProps {
  item: CartItemDTO;
  onUpdateQuantity: (delta: number) => void;
  onRemove: () => void;
}

export function CartItemCard({ item, onUpdateQuantity, onRemove }: CartItemCardProps) {
  const { lang, t } = useLanguage();
  const name = lang === 'en' && item.menuItemNameEn ? item.menuItemNameEn : item.menuItemName;
  
  // Format modifiers text
  const modifiersText = item.selectedModifiers
    .map(m => m.modifierName)
    .join(', ');

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
      <div className="flex flex-col flex-grow justify-between min-w-0">
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
          <p className="text-emerald-500 font-semibold text-sm mt-1">{formatVND(item.basePrice)}</p>
          {modifiersText && (
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
              {modifiersText}
            </p>
          )}
          {item.notes ? (
            <div className="flex items-center gap-1 mt-2 text-xs text-slate-500 dark:text-slate-400">
              <FileEdit className="size-3.5" />
              <span className="line-clamp-1">
                {t.cart.note}: {item.notes}
              </span>
            </div>
          ) : (
            <button className="flex items-center gap-1 mt-2 text-xs text-slate-400 dark:text-slate-500 hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors">
              <FileEdit className="size-3.5" />
              <span>{t.cart.addNote}</span>
            </button>
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
            {formatVND(item.totalPrice)}
          </span>
        </div>
      </div>
    </div>
  );
}
