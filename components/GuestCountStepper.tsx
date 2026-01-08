"use client";

import { useState, useEffect } from "react";
import { useLanguage } from "@/lib/i18n/context";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Minus, Plus, Users } from "lucide-react";
import { cn } from "@/lib/utils";

const GUEST_COUNT_STORAGE_KEY = "qrenso_guest_count";
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

  // Notify parent of initial value and changes
  useEffect(() => {
    onChange?.(count);
  }, [count, onChange]);

  const updateCount = (newCount: number) => {
    if (newCount >= MIN_GUESTS && newCount <= MAX_GUESTS) {
      setCount(newCount);
      localStorage.setItem(GUEST_COUNT_STORAGE_KEY, String(newCount));
    }
  };

  return (
    <Card className="relative overflow-hidden rounded-2xl border-0 bg-white dark:bg-slate-800 p-5 shadow-xl shadow-slate-200/40 dark:shadow-none ring-1 ring-slate-100 dark:ring-slate-700">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex flex-col gap-0.5">
            <span className="text-base font-bold text-slate-900 dark:text-white">
              {t.guestCount.title}
            </span>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              {t.guestCount.subtitle}
            </span>
          </div>
        </div>

        {/* Stepper Controls */}
        <div className="flex items-center gap-3 rounded-full bg-slate-50 dark:bg-slate-700 p-1 ring-1 ring-slate-200 dark:ring-slate-600">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Decrease guests"
            onClick={() => updateCount(count - 1)}
            disabled={count <= MIN_GUESTS}
            className={cn(
              "size-10 rounded-full bg-white dark:bg-slate-600 shadow-sm active:scale-95 disabled:opacity-50 disabled:shadow-none",
              count <= MIN_GUESTS
                ? "text-slate-300 dark:text-slate-500"
                : "text-slate-600 dark:text-slate-200",
            )}
          >
            <Minus className="size-5" />
          </Button>

          <div className="w-10 text-center">
            <span className="font-display text-xl font-bold tabular-nums text-slate-900 dark:text-white">
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
              "size-10 rounded-full bg-emerald-500 text-white shadow-md shadow-emerald-500/30 active:scale-95 disabled:opacity-50 disabled:shadow-none disabled:bg-slate-200 dark:disabled:bg-slate-600 disabled:text-slate-400 dark:disabled:text-slate-500",
            )}
          >
            <Plus className="size-5" />
          </Button>
        </div>
      </div>
    </Card>
  );
}

