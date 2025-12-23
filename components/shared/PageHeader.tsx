'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { LanguageToggle } from '@/components/LanguageToggle';
import { ThemeToggle } from '@/components/ThemeToggle';

interface PageHeaderProps {
  /** Page title displayed in the header */
  title: string;
  /** Optional subtitle below the title */
  subtitle?: string;
  /** If provided, renders back button as Link */
  backHref?: string;
  /** If provided, renders back button with onClick handler */
  onBack?: () => void;
  /** Explicitly hide back button even if backHref/onBack is provided. Default: true when backHref or onBack is set */
  showBackButton?: boolean;
  /** Additional content to render on the right side (after theme/language toggles) */
  rightContent?: React.ReactNode;
  /** Max width class for the container */
  maxWidth?: 'sm' | 'md' | 'lg' | '2xl' | '7xl' | '6xl' | 'full';
  /** Custom header height class. Default: h-16 */
  headerHeight?: string;
  /** Whether to show bottom border */
  bottomBorder?: boolean;
}

const maxWidthClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  '2xl': 'max-w-2xl',
  '6xl': 'max-w-6xl',
  '7xl': 'max-w-7xl',
  'full': 'max-w-full',
};

export function PageHeader({
  title,
  subtitle,
  backHref,
  onBack,
  showBackButton,
  rightContent,
  maxWidth = '7xl',
  headerHeight = 'h-16',
  bottomBorder = true,
}: PageHeaderProps) {
  // Determine if back button should show
  const shouldShowBack = showBackButton ?? (!!backHref || !!onBack);

  const BackButton = () => (
    <button
      onClick={onBack}
      className="flex size-10 shrink-0 items-center justify-center rounded-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-transparent transition hover:bg-gray-100 dark:hover:bg-slate-700"
    >
      <ArrowLeft className="size-5" />
    </button>
  );

  const BackLink = () => (
    <Link
      href={backHref!}
      className="flex size-10 shrink-0 items-center justify-center rounded-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-transparent transition hover:bg-gray-100 dark:hover:bg-slate-700"
    >
      <ArrowLeft className="size-5" />
    </Link>
  );

  return (
    <header className={`sticky top-0 z-40 w-full ${bottomBorder ? 'border-b border-gray-200 dark:border-slate-700/50' : ''} bg-gray-50/95 dark:bg-slate-900/95 backdrop-blur-md`}>
      <div className={`mx-auto flex ${headerHeight} items-center justify-between px-4 lg:px-6 ${maxWidthClasses[maxWidth]}`}>
        <div className="flex items-center gap-3 overflow-hidden">
          {shouldShowBack && (backHref ? <BackLink /> : onBack ? <BackButton /> : null)}
          <div className="flex flex-col min-w-0">
            <h1 className="truncate text-lg font-bold leading-tight">{title}</h1>
            {subtitle && (
              <p className="truncate text-xs font-medium text-emerald-600 dark:text-emerald-400">
                {subtitle}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <LanguageToggle />
          {rightContent}
        </div>
      </div>
    </header>
  );
}

