"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/lib/i18n/context";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface StartSessionButtonProps {
  tenantSlug: string;
  tableCode: string;
  token?: string; // QR token from URL (not used anymore, session is auto-created)
  disabled?: boolean;
}

export function StartSessionButton({
  tenantSlug,
  tableCode,
  token,
  disabled,
}: StartSessionButtonProps) {
  const { t } = useLanguage();
  const router = useRouter();

  const handleStartSession = useCallback(() => {
    if (disabled) return;

    // Session is already created automatically when QR token is verified
    // Just navigate to menu
    router.push(`/${tenantSlug}/menu`);
  }, [tenantSlug, router, disabled]);

  return (
    <div className="flex flex-col items-center gap-2 w-full">
      <Button
        type="button"
        onClick={handleStartSession}
        disabled={disabled}
        className={cn(
          "group relative h-16 w-full overflow-hidden rounded-full px-8 transition-colors",
          disabled
            ? "cursor-not-allowed bg-slate-100 dark:bg-slate-800 ring-1 ring-slate-200 dark:ring-slate-700"
            : "bg-emerald-500 hover:bg-emerald-600 dark:bg-emerald-500 dark:hover:bg-emerald-400 shadow-lg shadow-emerald-500/30 active:scale-[0.98]",
        )}
      >
        <div
          className={cn(
            "relative flex w-full items-center justify-between",
            disabled ? "text-slate-400" : "text-white",
          )}
        >
          <span className="flex items-center gap-2 text-lg font-bold tracking-tight">
            {disabled ? (
              "Vui lòng đợi..."
            ) : (
              <>
                <Sparkles className="size-5 text-emerald-900/40" />
                {t.cta.startOrdering}
              </>
            )}
          </span>

          <div
            className={cn(
              "flex size-10 items-center justify-center rounded-full",
              disabled ? "bg-slate-200" : "bg-white/20",
            )}
          >
            <ArrowRight
              className={cn(
                "size-5",
                disabled ? "text-slate-400" : "text-white",
              )}
            />
          </div>
        </div>
      </Button>
    </div>
  );
}
