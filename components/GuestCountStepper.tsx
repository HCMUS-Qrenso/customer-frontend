'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '@/lib/i18n/context';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Minus, Plus } from 'lucide-react';

const GUEST_COUNT_STORAGE_KEY = 'qrenso_guest_count';
const MIN_GUESTS = 1;
const MAX_GUESTS = 20;

interface GuestCountStepperProps {
  onChange?: (count: number) => void;
}

export function GuestCountStepper({ onChange }: GuestCountStepperProps) {
  const { t } = useLanguage();
  const [count, setCount] = useState(2);

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(GUEST_COUNT_STORAGE_KEY);
    if (stored) {
      const parsed = parseInt(stored, 10);
      if (!isNaN(parsed) && parsed >= MIN_GUESTS && parsed <= MAX_GUESTS) {
        setCount(parsed);
      }
    }
  }, []);

  const updateCount = (newCount: number) => {
    if (newCount >= MIN_GUESTS && newCount <= MAX_GUESTS) {
      setCount(newCount);
      localStorage.setItem(GUEST_COUNT_STORAGE_KEY, String(newCount));
      onChange?.(newCount);
    }
  };

  return (
    <Card className="flex items-center justify-between gap-0 rounded-2xl border-0 p-5 shadow-[0_0_0_1px_rgba(226,232,240,1),0_2px_4px_rgba(0,0,0,0.05)]">
      <div className="flex flex-col">
        <span className="text-base font-bold text-slate-900">{t.guestCount.title}</span>
        <span className="text-xs font-medium text-slate-500">{t.guestCount.subtitle}</span>
      </div>

      {/* Stepper */}
      <div className="flex items-center gap-3 rounded-full bg-slate-50 p-1 ring-1 ring-slate-200">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="Decrease guests"
          onClick={() => updateCount(count - 1)}
          disabled={count <= MIN_GUESTS}
          className="size-10 rounded-full bg-white text-slate-600 shadow-sm hover:bg-slate-50 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Minus className="size-5" />
        </Button>

        <div className="w-8 text-center">
          <span className="text-lg font-bold text-slate-900">{count}</span>
        </div>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="Increase guests"
          onClick={() => updateCount(count + 1)}
          disabled={count >= MAX_GUESTS}
          className="size-10 rounded-full bg-emerald-500 text-emerald-900 shadow-sm hover:bg-emerald-600 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Plus className="size-5" />
        </Button>
      </div>
    </Card>
  );
}
