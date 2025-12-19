'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { MenuItemDTO } from '@/lib/types/menu';
import { formatUSD } from '@/lib/format';

interface MenuItemCardProps {
  item: MenuItemDTO;
  href: string;
  onQuickAdd?: (item: MenuItemDTO) => void;
}

export function MenuItemCard({ item, href, onQuickAdd }: MenuItemCardProps) {
  const isUnavailable = item.status === 'unavailable';
  const hasImage = item.images && item.images.length > 0;
  const imageUrl = item.images?.[0];

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isUnavailable && onQuickAdd) {
      onQuickAdd(item);
    }
  };

  return (
    <Link href={href} className="block">
      <div 
        className={`
          relative flex h-32 overflow-hidden rounded-xl shadow-sm
          ${isUnavailable ? 'opacity-70' : 'cursor-pointer active:opacity-90 hover:shadow-md transition-shadow'}
          ${item.isChefRecommendation ? 'ring-2 ring-emerald-500/40' : ''}
          bg-white dark:bg-slate-800
        `}
      >
        {/* Chef's Pick Badge */}
        {item.isChefRecommendation && !isUnavailable && (
          <div className="absolute right-0 top-0 z-10 rounded-bl-lg bg-emerald-500 px-2 py-0.5 text-[10px] font-bold uppercase text-emerald-950">
            Chef's Pick
          </div>
        )}

        {/* Image */}
        <div className="relative h-full w-32 shrink-0">
          {hasImage ? (
            <div
              className={`h-full w-full bg-cover bg-center ${isUnavailable ? 'grayscale' : ''}`}
              style={{ backgroundImage: `url('${imageUrl}')` }}
            />
          ) : (
            <div className={`flex h-full w-full items-center justify-center bg-gray-100 dark:bg-slate-700 ${isUnavailable ? 'grayscale' : ''}`}>
              <svg className="size-12 text-gray-300 dark:text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
          {isUnavailable && (
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
            <h4 className={`font-bold leading-tight text-slate-900 dark:text-white truncate ${item.isChefRecommendation ? 'pr-16' : ''}`}>
              {item.name}
            </h4>
            {item.description && (
              <p className="mt-1 line-clamp-2 text-xs text-slate-500 dark:text-slate-400">
                {item.description}
              </p>
            )}
          </div>

          <div className="flex items-end justify-between mt-auto">
            <div className="flex flex-col">
              <span className={`font-bold ${isUnavailable ? 'text-slate-400 dark:text-slate-500' : 'text-emerald-600 dark:text-emerald-400'}`}>
                {formatUSD(item.base_price)}
              </span>
              {/* Show category name as a hint */}
              {item.category?.name && (
                <span className="text-[10px] text-slate-400 dark:text-slate-500">{item.category.name}</span>
              )}
            </div>

            {!isUnavailable && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleQuickAdd}
                className={`size-8 rounded-full shrink-0 active:scale-95 ${
                  item.isChefRecommendation 
                    ? 'bg-emerald-500 text-emerald-950 shadow-lg active:bg-emerald-600' 
                    : 'bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-500 active:bg-emerald-500/20 dark:active:bg-emerald-500/30'
                }`}
              >
                <Plus className="size-5" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
