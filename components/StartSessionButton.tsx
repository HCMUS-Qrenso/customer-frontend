"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/lib/i18n/context";
// import { useStartSessionMutation } from "@/hooks/use-table-session-mutation";
import { Button } from "@/components/ui/button";
import { ArrowRight, Loader2 } from "lucide-react";

// const SESSION_TOKEN_STORAGE_KEY = "qrenso_session_token";
// const GUEST_COUNT_STORAGE_KEY = "qrenso_guest_count";

interface StartSessionButtonProps {
  tenantSlug: string;
  tableCode: string;
  token?: string; // Pass token to menu page
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

  // Session logic temporarily disabled
  // const { mutateAsync: startSession, isPending } = useStartSessionMutation();

  const handleStartSession = useCallback(() => {
    if (disabled) return;

    // Navigate to menu with token
    const menuUrl = token 
      ? `/${tenantSlug}/menu?table=${tableCode}&token=${token}`
      : `/${tenantSlug}/menu?table=${tableCode}`;
    
    router.push(menuUrl);

    /* Session logic - temporarily commented out
    try {
      const storedPartySize = localStorage.getItem(GUEST_COUNT_STORAGE_KEY);
      const partySize = storedPartySize
        ? parseInt(storedPartySize, 10)
        : undefined;

      const result = await startSession({
        tenantSlug,
        tableCode,
        preferredLanguage: lang,
        partySize,
      });

      localStorage.setItem(SESSION_TOKEN_STORAGE_KEY, result.sessionToken);
      router.push(`/${tenantSlug}/t/${tableCode}/menu`);
    } catch (error) {
      console.error("Failed to start session:", error);
    }
    */
  }, [tenantSlug, tableCode, token, router, disabled]);

  return (
    <Button
      type="button"
      onClick={handleStartSession}
      disabled={disabled}
      className={`
        group relative h-14 w-full rounded-full text-[17px] font-bold tracking-tight shadow-lg transition-all
        ${
          disabled
            ? "cursor-not-allowed bg-slate-300"
            : "bg-emerald-500 text-emerald-900 shadow-emerald-500/30 hover:bg-emerald-600 active:scale-[0.98]"
        }
      `}
    >
      <span className="absolute inset-0 rounded-full bg-white/20 opacity-0 transition-opacity group-hover:opacity-100" />

      <div className="flex items-center gap-2">
        <span>{t.cta.startOrdering}</span>
        <ArrowRight className="size-5 transition-transform group-hover:translate-x-1" />
      </div>
    </Button>
  );
}
