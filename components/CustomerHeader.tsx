'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ShoppingCart } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { LanguageToggle } from '@/components/LanguageToggle';
import { cn } from '@/lib/utils';

interface CustomerHeaderProps {
  /** Page title displayed in center */
  title?: string;
  /** Subtitle below title */
  subtitle?: string;
  /** URL for back button - if not provided, uses router.back() */
  backHref?: string;
  /** Custom back handler - overrides backHref */
  onBack?: () => void;
  /** URL for cart button */
  cartHref?: string;
  /** Number of items in cart */
  cartCount?: number;
  /** Show theme toggle button (default: true) */
  showThemeToggle?: boolean;
  /** Show language toggle button (default: true) */
  showLanguageToggle?: boolean;
  /** Show cart button (default: false) */
  showCart?: boolean;
  /** Additional className for container */
  className?: string;
}

export function CustomerHeader({
  title,
  subtitle,
  backHref,
  onBack,
  cartHref,
  cartCount = 0,
  showThemeToggle = true,
  showLanguageToggle = true,
  showCart = false,
  className,
}: CustomerHeaderProps) {
  const router = useRouter();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else if (backHref) {
      router.push(backHref);
    } else {
      router.back();
    }
  };

  return (
    <header
      className={cn(
        'sticky top-0 z-40 flex h-[60px] items-center justify-between border-b px-4 backdrop-blur-md transition-colors',
        'border-gray-200 dark:border-slate-700/50',
        'bg-gray-50/95 dark:bg-slate-900/95',
        className
      )}
    >
      {/* Left: Back button + Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleBack}
          className={cn(
            'flex size-10 items-center justify-center rounded-full border transition-colors',
            'border-gray-200 dark:border-transparent',
            'bg-white dark:bg-slate-800',
            'hover:bg-gray-100 dark:hover:bg-slate-700',
            'text-slate-700 dark:text-slate-200'
          )}
        >
          <ArrowLeft className="size-5" />
        </button>
        
        {(title || subtitle) && (
          <div className="flex flex-col">
            {title && (
              <h1 className="text-lg font-bold leading-tight tracking-tight text-slate-900 dark:text-white truncate max-w-[200px] sm:max-w-none">
                {title}
              </h1>
            )}
            {subtitle && (
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                {subtitle}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        {showThemeToggle && <ThemeToggle />}
        {showLanguageToggle && <LanguageToggle />}
        
        {showCart && cartHref && (
          <Link
            href={cartHref}
            className={cn(
              'relative flex size-10 items-center justify-center rounded-full transition-colors',
              'hover:bg-gray-100 dark:hover:bg-slate-800',
              'text-slate-700 dark:text-slate-200'
            )}
          >
            <ShoppingCart className="size-5" />
            {cartCount > 0 && (
              <span className="absolute right-1 top-1 flex size-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75" />
                <span className="relative inline-flex size-2.5 rounded-full bg-emerald-500" />
              </span>
            )}
          </Link>
        )}
      </div>
    </header>
  );
}
