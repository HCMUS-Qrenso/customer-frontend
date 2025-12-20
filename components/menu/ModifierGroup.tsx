'use client';

import type { ModifierGroupDTO, Language } from '@/lib/types/menu';
import { formatVND } from '@/lib/format';

interface ModifierGroupProps {
  group: ModifierGroupDTO;
  selectedOptions: string[];
  onChange: (optionId: string) => void;
  language: Language;
}

export function ModifierGroup({ group, selectedOptions, onChange, language }: ModifierGroupProps) {
  const isRadio = group.type === 'single_choice';

  // Helper to get price from price_adjustment string
  const getPrice = (priceAdjustment: string): number => {
    return parseInt(priceAdjustment, 10) || 0;
  };

  // Helper to format price display
  const formatPriceAdjustment = (priceAdjustment: string): string => {
    const price = getPrice(priceAdjustment);
    if (price === 0) return 'Miễn phí';
    if (price > 0) return `+${formatVND(price)}`;
    return formatVND(price); // Negative numbers already have minus sign
  };

  return (
    <div className="rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between border-b border-gray-200 dark:border-slate-700 pb-3">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">{group.name}</h3>
        {group.is_required ? (
          <span className="rounded bg-red-500 px-2 py-1 text-xs font-bold text-white">
            Bắt buộc
          </span>
        ) : (
          <span className="text-xs text-slate-500 dark:text-slate-400">
            Chọn tối đa {group.max_selections || '∞'}
          </span>
        )}
      </div>

      {/* Options */}
      <div className="flex flex-col gap-3">
        {group.modifiers.map((modifier) => {
          const isSelected = selectedOptions.includes(modifier.id);
          const isDisabled = modifier.is_available === false;
          const price = getPrice(modifier.price_adjustment);

          return (
            <label
              key={modifier.id}
              className={`
                flex items-center justify-between rounded-lg border p-3 transition-all
                ${isDisabled
                  ? 'cursor-not-allowed border-gray-200 dark:border-slate-700 bg-gray-100 dark:bg-slate-900/50 opacity-50'
                  : `cursor-pointer border-gray-200 dark:border-slate-700 hover:border-emerald-500/50 ${
                      isSelected ? 'border-emerald-500 bg-emerald-500/10' : 'bg-gray-50 dark:bg-transparent'
                    }`
                }
              `}
            >
              <div className="flex items-center gap-3">
                <input
                  type={isRadio ? 'radio' : 'checkbox'}
                  name={group.id}
                  disabled={isDisabled}
                  checked={isSelected}
                  onChange={() => !isDisabled && onChange(modifier.id)}
                  className="size-5 accent-emerald-500"
                />
                <span className={`font-medium ${isDisabled ? 'line-through text-slate-400 dark:text-slate-500' : 'text-slate-900 dark:text-white'}`}>
                  {modifier.name}
                </span>
              </div>
              <span
                className={`text-sm ${
                  isDisabled
                    ? 'text-slate-400 dark:text-slate-500'
                    : price === 0
                      ? 'text-slate-500 dark:text-slate-400'
                      : price < 0
                        ? 'font-semibold text-blue-600 dark:text-blue-400'
                        : 'font-semibold text-emerald-600 dark:text-emerald-400'
                }`}
              >
                {isDisabled ? 'Hết hàng' : formatPriceAdjustment(modifier.price_adjustment)}
              </span>
            </label>
          );
        })}
      </div>
    </div>
  );
}
