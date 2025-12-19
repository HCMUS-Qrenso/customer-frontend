'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '@/lib/i18n/context';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Minus, Plus, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

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
    <Card className="relative overflow-hidden rounded-[1.5rem] border-0 bg-white p-5 shadow-xl shadow-slate-200/40 ring-1 ring-slate-100">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-500 shadow-sm ring-1 ring-indigo-100">
            <Users className="size-6" />
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-base font-bold text-slate-900">{t.guestCount.title}</span>
            <span className="text-xs font-medium text-slate-500">{t.guestCount.subtitle}</span>
          </div>
        </div>

        {/* Stepper Controls */}
        <div className="flex items-center gap-1 rounded-full bg-slate-50 p-1.5 ring-1 ring-slate-200/60">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Decrease guests"
            onClick={() => updateCount(count - 1)}
            disabled={count <= MIN_GUESTS}
            className={cn(
              "size-10 rounded-full bg-white shadow-sm active:scale-95 disabled:opacity-50 disabled:shadow-none",
              count <= MIN_GUESTS ? "text-slate-300" : "text-slate-600"
            )}
          >
            <Minus className="size-5" />
          </Button>

          <div className="w-10 text-center">
            <span className="font-display text-xl font-bold tabular-nums text-slate-900">
              {count}
            </span>
          </div>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Increase guests"
            onClick={() => updateCount(count + 1)}
            disabled={count >= MAX_GUESTS}
            className={cn(
              "size-10 rounded-full bg-indigo-500 text-white shadow-md shadow-indigo-500/20 active:scale-95 disabled:opacity-50 disabled:shadow-none disabled:bg-slate-200 disabled:text-slate-400",
            )}
          >
            <Plus className="size-5" />
          </Button>
        </div>
      </div>
    </Card>
  );
}


