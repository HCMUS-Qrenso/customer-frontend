'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { Moon, Sun, Monitor } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function ThemeToggle({ className }: { className?: string }) {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button
        variant="ghost"
        size="icon"
        className={cn('size-10 rounded-full', className)}
        disabled
      >
        <Sun className="size-5" />
      </Button>
    );
  }

  // Cycle through: light → dark → system → light
  const cycleTheme = () => {
    if (theme === 'light') {
      setTheme('dark');
    } else if (theme === 'dark') {
      setTheme('system');
    } else {
      setTheme('light');
    }
  };

  const getIcon = () => {
    switch (theme) {
      case 'light':
        return <Sun className="size-5" />;
      case 'dark':
        return <Moon className="size-5" />;
      default:
        return <Monitor className="size-5" />;
    }
  };

  const getLabel = () => {
    switch (theme) {
      case 'light':
        return 'Chế độ sáng';
      case 'dark':
        return 'Chế độ tối';
      default:
        return 'Theo hệ thống';
    }
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={cycleTheme}
      className={cn(
        'size-10 rounded-full transition-colors',
        'hover:bg-slate-100 dark:hover:bg-slate-800',
        className
      )}
      title={getLabel()}
    >
      {getIcon()}
      <span className="sr-only">{getLabel()}</span>
    </Button>
  );
}
