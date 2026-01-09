"use client";

import { useState } from "react";
import { Loader2, User, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useItemReviews } from "@/hooks/use-reviews";
import { RatingStars, RatingDistribution } from "@/components/shared/RatingDisplay";
import type { ReviewResponseDTO } from "@/lib/types/review";

interface ItemReviewsProps {
  menuItemId: string;
}

export function ItemReviews({ menuItemId }: ItemReviewsProps) {
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const { data, isLoading, error } = useItemReviews(menuItemId, page, pageSize);

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="size-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  if (error || !data) {
    return null;
  }

  const { reviews, stats, total } = data;
  const totalPages = Math.ceil(total / pageSize);

  if (total === 0) {
    return (
      <div className="rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-8 text-center">
        <p className="text-slate-500 dark:text-slate-400">
          Chưa có đánh giá nào cho món này
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Rating Summary */}
      <RatingDistribution stats={stats} />

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.map((review) => (
          <ReviewCard key={review.id} review={review} />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Trang trước
          </Button>
          <span className="flex items-center px-4 text-sm text-slate-600 dark:text-slate-400">
            Trang {page} / {totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            Trang sau
          </Button>
        </div>
      )}
    </div>
  );
}

function ReviewCard({ review }: { review: ReviewResponseDTO }) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date);
  };

  return (
    <div className="rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4">
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div className="shrink-0">
          {review.customer.avatarUrl ? (
            <img
              src={review.customer.avatarUrl}
              alt={review.customer.fullName}
              className="size-10 rounded-full object-cover"
            />
          ) : (
            <div className="flex size-10 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600">
              <User className="size-5" />
            </div>
          )}
        </div>

        {/* Review Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h4 className="font-semibold text-slate-900 dark:text-white">
                  {review.customer.fullName}
                </h4>
                {review.isVerifiedPurchase && (
                  <div className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="size-3" />
                    <span>Đã mua</span>
                  </div>
                )}
              </div>
              <RatingStars rating={review.rating} size="sm" />
            </div>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {formatDate(review.createdAt)}
            </span>
          </div>

          {review.comment && (
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {review.comment}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
