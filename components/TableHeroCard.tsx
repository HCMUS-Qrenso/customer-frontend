"use client";

import { useLanguage } from "@/lib/i18n/context";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  CheckCircle2,
  AlertTriangle,
  UtensilsCrossed,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface TableHeroCardProps {
  tableNumber: string;
  capacity: number;
  isActive: boolean;
  zoneName?: string;
  coverImageUrl?: string;
}

export function TableHeroCard({
  tableNumber,
  capacity,
  isActive,
  coverImageUrl,
}: TableHeroCardProps) {
  const { t } = useLanguage();

  const defaultCover =
    "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80";

  return (
    <Card className="relative overflow-hidden gap-0 rounded-3xl border-0 py-0 shadow-xl shadow-slate-200/50 dark:shadow-none ring-1 ring-slate-100 dark:ring-slate-700">
      {/* Cover Image Area */}
      <div className="relative aspect-[16/9] w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url("${coverImageUrl || defaultCover}")` }}
        />
        {/* Modern Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

        {/* Floating Glass Badges - Only capacity badge now */}
        <div className="absolute bottom-4 left-4 flex items-center gap-2">
          <Badge
            variant="secondary"
            className="gap-1.5 border-white/10 bg-black/40 px-3 py-1.5 text-xs font-semibold text-white shadow-sm backdrop-blur-md"
          >
            <Users className="size-3.5" />
            {t.table.maxGuests} {capacity}
          </Badge>
        </div>
      </div>

      {/* Card Detail Content */}
      <CardContent className="relative flex flex-col gap-4 bg-white dark:bg-slate-800 p-5 sm:p-6">
        {/* Current Table Section */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              {t.header.currentTable}
            </p>
            <h2 className="font-display text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Bàn {tableNumber}
            </h2>
          </div>
          <div className="flex size-12 items-center justify-center rounded-full bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
            <UtensilsCrossed className="size-7" />
          </div>
        </div>

        <hr className="border-dashed border-slate-200 dark:border-slate-700" />

        {/* Status Info */}
        <div className="flex items-start gap-3">
          {isActive ? (
            <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-emerald-500" />
          ) : (
            <AlertTriangle className="mt-0.5 size-5 shrink-0 text-amber-500" />
          )}
          <div>
            <p
              className={cn(
                "text-sm font-semibold",
                isActive
                  ? "text-slate-900 dark:text-white"
                  : "text-amber-900 dark:text-amber-400",
              )}
            >
              {isActive
                ? t.table.activeDescription
                : t.table.inactiveDescription}
            </p>
            <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-400">
              {isActive
                ? "Scan valid. You can start ordering immediately."
                : "Vui lòng liên hệ nhân viên để được hỗ trợ mở bàn."}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
