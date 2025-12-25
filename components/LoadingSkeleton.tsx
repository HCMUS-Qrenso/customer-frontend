"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export function LoadingSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      {/* Hero Card Skeleton */}
      <Card className="overflow-hidden rounded-3xl border-0 p-0 shadow-[0_0_0_1px_rgba(226,232,240,1),0_2px_4px_rgba(0,0,0,0.05)]">
        {/* Cover Image Skeleton */}
        <Skeleton className="aspect-[16/9] w-full rounded-none" />

        {/* Content Skeleton */}
        <CardContent className="space-y-4 p-5">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-10 w-32" />
            </div>
            <Skeleton className="size-12 rounded-full" />
          </div>

          <hr className="border-dashed border-slate-200" />

          <div className="flex items-start gap-3">
            <Skeleton className="size-5 rounded-full" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-3 w-full" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Guest Count Skeleton */}
      <Card className="rounded-2xl border-0 p-5 shadow-[0_0_0_1px_rgba(226,232,240,1),0_2px_4px_rgba(0,0,0,0.05)]">
        <div className="flex items-center justify-between">
          <div className="space-y-1.5">
            <Skeleton className="h-5 w-28" />
            <Skeleton className="h-3 w-36" />
          </div>
          <Skeleton className="h-12 w-32 rounded-full" />
        </div>
      </Card>
    </div>
  );
}
