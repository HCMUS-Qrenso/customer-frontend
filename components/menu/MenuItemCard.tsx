'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { MenuItemDTO } from '@/lib/types/menu';
import { Language } from '@/lib/i18n/translations';
import { formatUSD } from '@/lib/format';

interface MenuItemCardProps {
  item: MenuItemDTO;
  href: string;
  language: Language;
  onQuickAdd?: (item: MenuItemDTO) => void;
}

export function MenuItemCard({ item, href, language, onQuickAdd }: MenuItemCardProps) {
  const name = language === 'en' && item.nameEn ? item.nameEn : item.name;
  const description = language === 'en' && item.descriptionEn ? item.descriptionEn : item.description;
  const isSoldOut = item.status === 'sold_out';

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isSoldOut && onQuickAdd) {
      onQuickAdd(item);
    }
  };

  return (
    <Link href={href} className="block">
      <div 
        className={`
          relative flex h-32 overflow-hidden rounded-xl transition-shadow
          ${isSoldOut ? 'opacity-70' : 'hover:shadow-md cursor-pointer'}
          ${item.isChefRecommendation ? 'ring-1 ring-emerald-500/30' : ''}
          bg-slate-800
        `}
      >
        {/* Chef's Pick Badge */}
        {item.isChefRecommendation && !isSoldOut && (
          <div className="absolute right-0 top-0 z-10 rounded-bl-lg bg-emerald-500 px-2 py-0.5 text-[10px] font-bold uppercase text-emerald-950">
            Chef&apos;s Pick
          </div>
        )}

        {/* Image */}
        <div className="relative h-full w-32 shrink-0">
          <div
            className={`h-full w-full bg-cover bg-center ${isSoldOut ? 'grayscale' : ''}`}
            style={{ backgroundImage: `url('${item.primaryImageUrl}')` }}
          />
          {isSoldOut && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
              <span className="rounded border border-white px-2 py-0.5 text-xs font-bold uppercase text-white">
                Sold Out
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex flex-1 flex-col justify-between p-3 min-w-0">
          <div className="min-w-0">
            <h4 className={`font-bold leading-tight text-white truncate ${item.isChefRecommendation ? 'pr-16' : ''}`}>
              {name}
            </h4>
            {description && (
              <p className="mt-1 line-clamp-2 text-xs text-slate-400">
                {description}
              </p>
            )}
          </div>

          <div className="flex items-end justify-between mt-auto">
            <div className="flex flex-col">
              <span className={`font-bold text-emerald-400 ${isSoldOut ? 'text-slate-500' : ''}`}>
                {formatUSD(item.price)}
              </span>
              {item.hasModifiers && (
                <span className="text-[10px] text-slate-500">Customizable</span>
              )}
            </div>

            {!isSoldOut && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleQuickAdd}
                className={`size-8 rounded-full transition-colors shrink-0 ${
                  item.isChefRecommendation 
                    ? 'bg-emerald-500 text-emerald-950 shadow-lg hover:bg-emerald-600' 
                    : 'bg-emerald-500/20 text-emerald-500 hover:bg-emerald-500/30'
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
