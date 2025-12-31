"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/lib/i18n/context";
import { useStartSessionMutation } from "@/hooks/use-table-session-mutation";
import { setSessionToken } from "@/lib/stores/qr-token-store";
import { Button } from "@/components/ui/button";
import { ArrowRight, Loader2, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const GUEST_COUNT_STORAGE_KEY = "qrenso_guest_count";

interface StartSessionButtonProps {
  tenantSlug: string;
  tableCode: string;
  token?: string; // QR token from URL
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
  const [error, setError] = useState<string | null>(null);

  const { mutateAsync: startSession, isPending } = useStartSessionMutation();

  const handleStartSession = useCallback(async () => {
    if (disabled || isPending) return;

    setError(null);

    try {
      // Get guest count from localStorage (default to 2)
      const storedCount = localStorage.getItem(GUEST_COUNT_STORAGE_KEY);
      const partySize = storedCount ? parseInt(storedCount, 10) : 2;

      // Get preferred language
      const storedLang = localStorage.getItem("preferred_language");
      const preferredLanguage = storedLang === "en" ? "en" : "vi";

      // Call API to start/join session
      const result = await startSession({
        tenantSlug,
        tableCode,
        partySize,
        preferredLanguage,
      });

      if (result.success && result.data?.session_token) {
        // Store session token for subsequent API calls
        setSessionToken(result.data.session_token);

        // Navigate to menu (no need to pass token in URL anymore)
        router.push(`/${tenantSlug}/menu`);
      } else {
        setError("Failed to start session. Please try again.");
      }
    } catch (err: any) {
      console.error("Start session error:", err);
      setError(err.message || "Failed to start session. Please try again.");
    }
  }, [tenantSlug, tableCode, router, disabled, isPending, startSession]);

  const isDisabled = disabled || isPending;

  return (
    <div className="flex flex-col items-center gap-2 w-full">
      <Button
        type="button"
        onClick={handleStartSession}
        disabled={isDisabled}
        className={cn(
          "group relative h-16 w-full overflow-hidden rounded-full px-8 transition-colors",
          isDisabled
            ? "cursor-not-allowed bg-slate-100 dark:bg-slate-800 ring-1 ring-slate-200 dark:ring-slate-700"
            : "bg-emerald-500 hover:bg-emerald-600 dark:bg-emerald-500 dark:hover:bg-emerald-400 shadow-lg shadow-emerald-500/30 active:scale-[0.98]",
        )}
      >
        <div
          className={cn(
            "relative flex w-full items-center justify-between",
            isDisabled ? "text-slate-400" : "text-white",
          )}
        >
          <span className="flex items-center gap-2 text-lg font-bold tracking-tight">
            {isPending ? (
              <>
                <Loader2 className="size-5 animate-spin" />
                Đang xử lý...
              </>
            ) : disabled ? (
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
              isDisabled ? "bg-slate-200" : "bg-white/20",
            )}
          >
            {isPending ? (
              <Loader2 className="size-5 animate-spin text-slate-400" />
            ) : (
              <ArrowRight
                className={cn("size-5", isDisabled ? "text-slate-400" : "text-white")}
              />
            )}
          </div>
        </div>
      </Button>
      
      {error && (
        <p className="text-sm text-red-500 dark:text-red-400 text-center">
          {error}
        </p>
      )}
    </div>
  );
}
