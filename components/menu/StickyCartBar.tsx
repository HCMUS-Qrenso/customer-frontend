"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { CartSummaryDTO } from "@/lib/types/menu";
import { Translations } from "@/lib/i18n/context";
import { useTenantSettings } from "@/providers/tenant-settings-context";

interface StickyCartBarProps {
  cart: CartSummaryDTO;
  href: string;
  t: Translations;
}

export function StickyCartBar({ cart, href, t }: StickyCartBarProps) {
  const { formatPrice } = useTenantSettings();
  if (cart.count === 0) return null;

  return (
    <div className="fixed bottom-0 left-1/2 z-50 w-full max-w-[480px] -translate-x-1/2 px-4 pb-[calc(env(safe-area-inset-bottom,16px)+16px)] lg:max-w-2xl">
      <Link href={href}>
        <Button className="flex h-14 w-full items-center justify-between rounded-full bg-emerald-500 px-5 text-emerald-950 shadow-lg shadow-emerald-500/30 transition-all hover:bg-emerald-600 active:scale-[0.98]">
          <div className="flex items-center gap-3">
            <span className="flex size-7 items-center justify-center rounded-full bg-emerald-950/20 text-sm font-bold">
              {cart.count}
            </span>
            <span className="font-bold">{formatPrice(cart.subtotal)}</span>
          </div>

          <div className="flex items-center gap-2 font-bold">
            <span>{t.menu.viewCart}</span>
            <ArrowRight className="size-5" />
          </div>
        </Button>
      </Link>
    </div>
  );
}
