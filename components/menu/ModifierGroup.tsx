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

  return (
    <div className="rounded-xl border border-slate-700 bg-slate-800 p-4">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between border-b border-slate-700 pb-3">
        <h3 className="text-lg font-bold text-white">{group.name}</h3>
        {group.is_required ? (
          <span className="rounded bg-red-500 px-2 py-1 text-xs font-bold text-white">
            Bắt buộc
          </span>
        ) : (
          <span className="text-xs text-slate-400">
            Chọn tối đa {group.max_selections || '∞'}
          </span>
        )}
      </div>

      {/* Options */}
      <div className="flex flex-col gap-3">
        {group.modifiers.map((modifier) => {
          const isSelected = selectedOptions.includes(modifier.id);
          const isDisabled = modifier.is_available === false;

          return (
            <label
              key={modifier.id}
              className={`
                flex items-center justify-between rounded-lg border p-3 transition-all
                ${isDisabled
                  ? 'cursor-not-allowed border-slate-700 bg-slate-900/50 opacity-50'
                  : `cursor-pointer border-slate-700 hover:border-emerald-500/50 ${
                      isSelected ? 'border-emerald-500 bg-emerald-500/10' : ''
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
                <span className={`font-medium ${isDisabled ? 'line-through text-slate-500' : 'text-white'}`}>
                  {modifier.name}
                </span>
              </div>
              <span
                className={`text-sm ${
                  isDisabled
                    ? 'text-slate-500'
                    : modifier.price === 0
                      ? 'text-slate-400'
                      : 'font-semibold text-emerald-400'
                }`}
              >
                {isDisabled
                  ? 'Hết hàng'
                  : modifier.price === 0
                    ? 'Miễn phí'
                    : `+${formatVND(modifier.price)}`
                }
              </span>
            </label>
          );
        })}
      </div>
    </div>
  );
}
