'use client';

import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Sparkles } from 'lucide-react';
import { MenuItemDTO } from '@/lib/types/menu';
import { Language, Translations } from '@/lib/i18n/translations';
import { formatUSD } from '@/lib/format';

interface ChefPicksCarouselProps {
  items: MenuItemDTO[];
  tenantSlug: string;
  tableCode: string;
  language: Language;
  t: Translations;
}

export function ChefPicksCarousel({ 
  items, 
  tenantSlug, 
  tableCode, 
  language, 
  t 
}: ChefPicksCarouselProps) {
  if (items.length === 0) return null;

  return (
    <section className="pb-2 pt-6">
      <div className="mb-3 flex items-center justify-between px-4 md:px-6">
        <h3 className="flex items-center gap-2 text-lg font-bold leading-tight tracking-tight text-white">
          <Sparkles className="size-5 text-emerald-500" />
          {t.menu.chefRecommendations}
        </h3>
      </div>

      <div className="flex gap-4 overflow-x-auto px-4 pb-4 no-scrollbar snap-x snap-mandatory md:px-6">
        {items.map((item) => {
          const name = language === 'en' && item.nameEn ? item.nameEn : item.name;
          const description = language === 'en' && item.descriptionEn ? item.descriptionEn : item.description;
          
          return (
            <Link
              key={item.id}
              href={`/${tenantSlug}/t/${tableCode}/menu/${item.id}`}
              className="group flex w-64 shrink-0 snap-start flex-col overflow-hidden rounded-xl bg-slate-800 shadow-sm transition-shadow hover:shadow-md md:w-72"
            >
              <div className="relative h-40 w-full overflow-hidden">
                <div
                  className="h-full w-full bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                  style={{ backgroundImage: `url('${item.primaryImageUrl}')` }}
                />
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                
                {/* Badge */}
                {item.badges?.[0] && (
                  <Badge className="absolute left-2 top-2 border-0 bg-emerald-500 px-2 py-1 text-xs font-bold uppercase tracking-wider text-emerald-950">
                    {item.badges[0]}
                  </Badge>
                )}

                {/* Price overlay */}
                <div className="absolute bottom-2 right-2">
                  <span className="font-bold text-emerald-400">
                    {formatUSD(item.price)}
                  </span>
                </div>

                {/* Title overlay */}
                <div className="absolute bottom-2 left-2 right-16">
                  <h4 className="truncate text-base font-bold text-white">
                    {name}
                  </h4>
                </div>
              </div>

              <div className="p-4">
                <p className="line-clamp-2 text-sm text-slate-400">
                  {description}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
