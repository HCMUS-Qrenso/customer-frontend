'use client';

import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Sparkles } from 'lucide-react';
import { MenuItemDTO } from '@/lib/types/menu';
import { useLanguage } from '@/lib/i18n/context';
import { formatUSD } from '@/lib/format';

interface ChefPicksCarouselProps {
  items: MenuItemDTO[];
  tenantSlug: string;
  tableCode: string;
  token: string;
}

export function ChefPicksCarousel({ 
  items, 
  tenantSlug, 
  tableCode,
  token,
}: ChefPicksCarouselProps) {
  const { t } = useLanguage();
  
  if (items.length === 0) return null;

  return (
    <section className="pb-2 pt-6">
      <div className="mb-3 flex items-center justify-between px-4 md:px-6">
        <h3 className="flex items-center gap-2 text-lg font-bold leading-tight tracking-tight text-slate-900 dark:text-white">
          <Sparkles className="size-5 text-emerald-500" />
          {t.menu.chefRecommendations}
        </h3>
      </div>

      <div className="flex gap-4 overflow-x-auto px-4 pb-4 no-scrollbar snap-x snap-mandatory md:px-6">
        {items.map((item) => {
          const hasImage = item.images && item.images.length > 0;
          // Get primary image (display_order = 0) or first image
          const primaryImage = item.images?.find(img => img.display_order === 0) || item.images?.[0];
          const imageUrl = primaryImage?.image_url;
          
          return (
            <Link
              key={item.id}
              href={`/${tenantSlug}/menu/${item.id}?table=${tableCode}&token=${token}`}
              className="group flex w-64 shrink-0 snap-start flex-col overflow-hidden rounded-xl bg-white dark:bg-slate-800 shadow-sm hover:shadow-md transition-shadow md:w-72 active:opacity-90"
            >
              <div className="relative h-40 w-full overflow-hidden">
                {hasImage ? (
                  <div
                    className="h-full w-full bg-cover bg-center"
                    style={{ backgroundImage: `url('${imageUrl}')` }}
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-gray-100 dark:bg-slate-700">
                    <svg className="size-16 text-gray-300 dark:text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
                {/* Gradient overlay - stronger at bottom for text readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                
                {/* Badge - Top Left */}
                {item.badges?.[0] && (
                  <Badge className="absolute left-2 top-2 border-0 bg-emerald-500 px-2 py-1 text-xs font-bold uppercase tracking-wider text-white">
                    {item.badges[0]}
                  </Badge>
                )}

                {/* Price - Top Right */}
                <div className="absolute right-2 top-2">
                  <div className="rounded-lg bg-emerald-500 px-2.5 py-1 shadow-md">
                    <span className="text-sm font-bold text-white">
                      {formatUSD(item.base_price)}
                    </span>
                  </div>
                </div>

                {/* Title - Bottom */}
                <div className="absolute bottom-0 left-0 right-0 p-3">
                  <h4 className="line-clamp-2 text-base font-bold leading-tight text-white">
                    {item.name}
                  </h4>
                </div>
              </div>

              <div className="p-4">
                <p className="line-clamp-2 text-sm text-slate-500 dark:text-slate-400">
                  {item.description}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
