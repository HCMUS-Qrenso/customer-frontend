'use client';

import { TenantSettings } from '@/lib/types/table';
import { useLanguage } from '@/lib/i18n/context';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Home, Users, UtensilsCrossed, CheckCircle2, AlertTriangle } from 'lucide-react';

interface TableHeroCardProps {
  tableNumber: string;
  capacity: number;
  isActive: boolean;
  zoneName?: string;
  coverImageUrl?: string;
  settings?: TenantSettings;
}

export function TableHeroCard({
  tableNumber,
  capacity,
  isActive,
  zoneName,
  coverImageUrl,
}: TableHeroCardProps) {
  const { t } = useLanguage();

  const defaultCover = 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80';

  return (
    <Card className="group relative flex flex-col gap-0 overflow-hidden rounded-3xl border-0 p-0 shadow-[0_0_0_1px_rgba(226,232,240,1),0_2px_4px_rgba(0,0,0,0.05)] transition-transform active:scale-[0.99]">
      {/* Cover Image */}
      <div className="relative aspect-[16/9] w-full bg-slate-100">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url("${coverImageUrl || defaultCover}")` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        
        {/* Floating Badges */}
        <div className="absolute bottom-4 left-4 flex flex-wrap items-center gap-2">
          {zoneName && (
            <Badge 
              variant="secondary" 
              className="gap-1.5 border-0 bg-white/20 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-md ring-1 ring-white/30"
            >
              <Home className="size-3.5" />
              {zoneName}
            </Badge>
          )}
          <Badge 
            variant="secondary" 
            className="gap-1.5 border-0 bg-black/40 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-md"
          >
            <Users className="size-3.5" />
            {t.table.maxGuests} {capacity}
          </Badge>
        </div>
      </div>

      {/* Card Content */}
      <CardContent className="flex flex-col gap-4 p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-wider text-slate-500">
              {t.header.currentTable}
            </p>
            <h2 className="font-display text-4xl font-extrabold tracking-tight text-slate-900">
              Bàn {tableNumber}
            </h2>
          </div>
          <div className="flex size-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
            <UtensilsCrossed className="size-7" />
          </div>
        </div>

        <hr className="border-dashed border-slate-200" />

        {/* Status Indicator */}
        <div className="flex items-start gap-3">
          {isActive ? (
            <>
              <CheckCircle2 className="mt-0.5 size-5 text-emerald-500" />
              <div>
                <p className="text-sm font-semibold text-slate-900">{t.table.active}</p>
                <p className="text-xs leading-relaxed text-slate-500">{t.table.activeDescription}</p>
              </div>
            </>
          ) : (
            <>
              <AlertTriangle className="mt-0.5 size-5 text-amber-500" />
              <div>
                <p className="text-sm font-semibold text-slate-900">{t.table.inactive}</p>
                <p className="text-xs leading-relaxed text-slate-500">{t.table.inactiveDescription}</p>
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
