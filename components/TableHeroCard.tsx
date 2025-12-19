'use client';

import { TenantSettings } from '@/lib/types/table';
import { useLanguage } from '@/lib/i18n/context';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Home, Users, CheckCircle2, AlertTriangle, UtensilsCrossed } from 'lucide-react';
import { cn } from '@/lib/utils';

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
    <Card className="relative overflow-hidden rounded-[2rem] border-0 shadow-xl shadow-slate-200/50 ring-1 ring-slate-100">
      {/* Cover Image Area */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-100">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url("${coverImageUrl || defaultCover}")` }}
        />
        {/* Modern Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/40 to-transparent" />
        
        {/* Floating Glass Badges */}
        <div className="absolute bottom-5 left-5 right-5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            {zoneName && (
              <Badge 
                variant="secondary" 
                className="gap-1.5 border-white/10 bg-white/20 px-3 py-1.5 text-xs font-semibold text-white shadow-sm backdrop-blur-md"
              >
                <Home className="size-3.5" />
                {zoneName}
              </Badge>
            )}
            <Badge 
              variant="secondary" 
              className="gap-1.5 border-white/10 bg-black/40 px-3 py-1.5 text-xs font-semibold text-white shadow-sm backdrop-blur-md"
            >
              <Users className="size-3.5" />
              {t.table.maxGuests} {capacity}
            </Badge>
          </div>
          
          {/* Status Badge on Image */}
          <Badge 
            className={cn(
              "gap-1.5 border-0 px-3 py-1.5 text-xs font-semibold backdrop-blur-md",
              isActive 
                ? "bg-emerald-500/90 text-white shadow-[0_0_15px_rgba(16,185,129,0.4)]" 
                : "bg-amber-500/90 text-white shadow-[0_0_15px_rgba(245,158,11,0.4)]"
            )}
          >
            {isActive ? (
              <>
                <CheckCircle2 className="size-3.5" />
                {t.table.active}
              </>
            ) : (
              <>
                <AlertTriangle className="size-3.5" />
                {t.table.inactive}
              </>
            )}
          </Badge>
        </div>
      </div>

      {/* Card Detail Content */}
      <CardContent className="relative flex flex-col gap-6 bg-white p-6 sm:p-7">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-xs font-bold uppercase tracking-widest text-emerald-600/80">
              {t.header.currentTable}
            </p>
            <h2 className="font-display text-[2.5rem] font-black leading-none tracking-tight text-slate-900">
              <span className="text-lg font-bold text-slate-400 align-top mr-1">No.</span>
              {tableNumber}
            </h2>
          </div>
          
          <div className="flex size-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 shadow-inner ring-1 ring-emerald-100">
            <UtensilsCrossed className="size-7" />
          </div>
        </div>

        {/* Info Box */}
        <div className={cn(
          "rounded-2xl border p-4",
          isActive 
            ? "border-emerald-100 bg-emerald-50/30" 
            : "border-amber-100 bg-amber-50/30"
        )}>
           <div className="flex gap-3">
              {isActive ? (
                <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-emerald-500" />
              ) : (
                <AlertTriangle className="mt-0.5 size-5 shrink-0 text-amber-500" />
              )}
              <div className="space-y-1">
                <p className={cn(
                  "text-sm font-bold",
                  isActive ? "text-emerald-900" : "text-amber-900"
                )}>
                  {isActive ? t.table.activeDescription : t.table.inactiveDescription}
                </p>
                <p className="text-xs leading-relaxed text-slate-500">
                  {isActive 
                    ? "Quét mã QR để xem menu và gọi món trực tiếp tại bàn này." 
                    : "Vui lòng liên hệ nhân viên để được hỗ trợ mở bàn."}
                </p>
              </div>
           </div>
        </div>
      </CardContent>
    </Card>
  );
}


