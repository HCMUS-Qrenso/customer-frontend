'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/app/lib/i18n/context';
import { StartSessionRequest, StartSessionResponse } from '@/app/[tenantSlug]/t/[tableCode]/types';
import { Button } from '@/components/ui/button';
import { ArrowRight, Loader2 } from 'lucide-react';

const SESSION_TOKEN_STORAGE_KEY = 'qrenso_session_token';
const GUEST_COUNT_STORAGE_KEY = 'qrenso_guest_count';

interface StartSessionButtonProps {
  tenantSlug: string;
  tableCode: string;
  disabled?: boolean;
}

export function StartSessionButton({ tenantSlug, tableCode, disabled }: StartSessionButtonProps) {
  const { t, lang } = useLanguage();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleStartSession = useCallback(async () => {
    if (isLoading || disabled) return;

    setIsLoading(true);

    try {
      // Get party size from localStorage
      const storedPartySize = localStorage.getItem(GUEST_COUNT_STORAGE_KEY);
      const partySize = storedPartySize ? parseInt(storedPartySize, 10) : undefined;

      const requestBody: StartSessionRequest = {
        tenantSlug,
        tableCode,
        preferredLanguage: lang,
        partySize,
      };

      const response = await fetch('/api/public/table-session/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error('Failed to start session');
      }

      const data: StartSessionResponse = await response.json();
      
      // Store session token
      localStorage.setItem(SESSION_TOKEN_STORAGE_KEY, data.sessionToken);

      // Navigate to menu
      router.push(`/${tenantSlug}/t/${tableCode}/menu`);
    } catch (error) {
      console.error('Failed to start session:', error);
      setIsLoading(false);
      // Could add error toast here
    }
  }, [tenantSlug, tableCode, lang, router, isLoading, disabled]);

  return (
    <Button
      type="button"
      onClick={handleStartSession}
      disabled={isLoading || disabled}
      className={`
        group relative h-14 w-full rounded-full text-[17px] font-bold tracking-tight shadow-lg transition-all
        ${disabled 
          ? 'cursor-not-allowed bg-slate-300' 
          : 'bg-emerald-500 text-emerald-900 shadow-emerald-500/30 hover:bg-emerald-600 active:scale-[0.98]'
        }
      `}
    >
      <span className="absolute inset-0 rounded-full bg-white/20 opacity-0 transition-opacity group-hover:opacity-100" />
      
      {isLoading ? (
        <div className="flex items-center gap-2">
          <Loader2 className="size-5 animate-spin text-emerald-900" />
          <span className="text-base font-semibold text-emerald-900">{t.cta.loading}</span>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <span>{t.cta.startOrdering}</span>
          <ArrowRight className="size-5 transition-transform group-hover:translate-x-1" />
        </div>
      )}
    </Button>
  );
}
