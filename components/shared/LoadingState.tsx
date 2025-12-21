'use client';

import { Skeleton } from '@/components/ui/skeleton';

interface LoadingStateProps {
  variant?: 'page' | 'card' | 'list';
  className?: string;
}

/**
 * Full-page loading skeleton with header, content, and CTA
 */
export function PageLoadingSkeleton() {
  return (
    <div className="relative flex min-h-svh w-full flex-col bg-slate-50/50 dark:bg-slate-900 shadow-2xl sm:min-h-screen transition-colors lg:px-40">
      {/* Background Pattern */}
      <div 
        className="pointer-events-none absolute inset-0 z-0 opacity-[0.03] dark:opacity-[0.05]" 
        style={{ backgroundImage: 'radial-gradient(#0f172a 1px, transparent 1px)', backgroundSize: '24px 24px' }} 
      />

      {/* Header skeleton */}
      <header className="sticky top-0 z-30 flex items-start justify-between bg-slate-50/95 dark:bg-slate-900/95 px-6 pb-2 pt-6 backdrop-blur-sm">
        <div className="flex flex-col gap-0.5">
          <Skeleton className="h-7 w-48 bg-slate-200 dark:bg-slate-700" />
          <div className="flex items-center gap-1">
            <Skeleton className="size-4 bg-slate-200 dark:bg-slate-700" />
            <Skeleton className="h-4 w-32 bg-slate-200 dark:bg-slate-700" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="size-10 rounded-full bg-slate-200 dark:bg-slate-700" />
          <Skeleton className="size-10 rounded-full bg-slate-200 dark:bg-slate-700" />
        </div>
      </header>

      {/* Main content skeleton */}
      <main className="relative z-10 flex flex-1 flex-col gap-6 px-5 pb-40 pt-2 sm:px-6">
        <Skeleton className="h-72 w-full rounded-3xl bg-slate-200 dark:bg-slate-700" />
        <Skeleton className="h-24 w-full rounded-2xl bg-slate-200 dark:bg-slate-700" />
      </main>

      {/* Sticky Bottom CTA skeleton */}
      <div className="fixed bottom-0 left-1/2 z-40 w-full -translate-x-1/2 lg:px-40">
        {/* Gradient Overlay */}
        <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-40 bg-linear-to-t from-white dark:from-slate-900 via-white/95 dark:via-slate-900/95 to-transparent" />

        <div className="relative flex flex-col items-center gap-3 px-6 pb-[calc(env(safe-area-inset-bottom,20px)+20px)] pt-4">
          <Skeleton className="h-12 w-full max-w-xs rounded-full bg-slate-200 dark:bg-slate-700" />
          <Skeleton className="h-3 w-48 bg-slate-200 dark:bg-slate-700" />
        </div>
      </div>
    </div>
  );
}

/**
 * Card loading skeleton
 */
export function CardLoadingSkeleton({ className }: { className?: string }) {
  return (
    <div className={`rounded-xl bg-white dark:bg-slate-800 p-4 shadow-sm ${className}`}>
      <Skeleton className="h-40 w-full rounded-lg bg-slate-200 dark:bg-slate-700 mb-4" />
      <Skeleton className="h-5 w-3/4 bg-slate-200 dark:bg-slate-700 mb-2" />
      <Skeleton className="h-4 w-1/2 bg-slate-200 dark:bg-slate-700" />
    </div>
  );
}

/**
 * List item loading skeleton
 */
export function ListItemLoadingSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 rounded-xl bg-white dark:bg-slate-800 p-4">
          <Skeleton className="size-16 rounded-lg bg-slate-200 dark:bg-slate-700" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4 bg-slate-200 dark:bg-slate-700" />
            <Skeleton className="h-3 w-1/2 bg-slate-200 dark:bg-slate-700" />
          </div>
          <Skeleton className="h-8 w-20 rounded-full bg-slate-200 dark:bg-slate-700" />
        </div>
      ))}
    </div>
  );
}

/**
 * Generic loading state wrapper
 */
export function LoadingState({ variant = 'page', className }: LoadingStateProps) {
  switch (variant) {
    case 'card':
      return <CardLoadingSkeleton className={className} />;
    case 'list':
      return <ListItemLoadingSkeleton />;
    case 'page':
    default:
      return <PageLoadingSkeleton />;
  }
}
