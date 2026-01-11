"use client";

import { Star, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useOrderReviews } from "@/hooks/use-reviews";
import { RatingStars } from "@/components/shared/RatingDisplay";
import { useLanguage } from "@/lib/i18n/context";

interface OrderReviewsDisplayProps {
  orderId: string;
}

export function OrderReviewsDisplay({ orderId }: OrderReviewsDisplayProps) {
  const { t } = useLanguage();
  const [expanded, setExpanded] = useState(false);

  const { data: reviews, isLoading } = useOrderReviews(orderId);

  if (isLoading) {
    return null;
  }

  const hasReviews = reviews && reviews.length > 0;
  const orderReview = hasReviews
    ? reviews.find((r) => r.reviewType === "order")
    : null;
  const itemReviews = hasReviews
    ? reviews.filter((r) => r.reviewType === "item")
    : [];

  return (
    <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
      <div
        className="flex items-center justify-between mb-2 cursor-pointer"
        onClick={() => hasReviews && setExpanded(!expanded)}
      >
        <div className="flex items-center gap-2">
          <Star className="size-4 fill-yellow-400 text-yellow-400" />
          <span className="text-sm font-medium text-slate-900 dark:text-white">
            {hasReviews ? (t.review?.yourReview || "Your Reviews") : (t.review?.noReview || "No reviews")}
          </span>
        </div>
        {hasReviews && (
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              setExpanded(!expanded);
            }}
            className="h-7 px-2 cursor-pointer"
          >
            {expanded ? (
              <ChevronUp className="size-4" />
            ) : (
              <ChevronDown className="size-4" />
            )}
          </Button>
        )}
      </div>

      {/* No reviews message */}
      {!hasReviews && (
        <div className="text-xs text-slate-500 dark:text-slate-400">
          {t.review?.noReviewYet || "You haven't reviewed this order yet"}
        </div>
      )}

      {/* Order Review Summary (Always visible) */}
      {hasReviews && orderReview && (
        <div className="flex items-center gap-2 text-sm">
          <RatingStars rating={orderReview.rating} size="sm" />
          <span className="text-slate-600 dark:text-slate-400">
            {t.review?.overallRating || "Overall Rating"}
          </span>
        </div>
      )}

      {/* Item Reviews Summary */}
      {itemReviews.length > 0 && !expanded && (
        <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          {itemReviews.length} {t.review?.itemReview || "items reviewed"}
        </div>
      )}

      {/* Expanded Details */}
      {expanded && (
        <div className="mt-3 space-y-3">
          {/* Order Review Detail */}
          {orderReview && orderReview.comment && (
            <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-3">
              <div className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                {t.review?.overallRating || "Overall Rating"}:
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                {orderReview.comment}
              </p>
            </div>
          )}

          {/* Item Reviews Detail */}
          {itemReviews.length > 0 && (
            <div className="space-y-2">
              <div className="text-xs font-medium text-slate-700 dark:text-slate-300">
                {t.review?.itemReview || "Item Reviews"}:
              </div>
              {itemReviews.map((review) => (
                <div
                  key={review.id}
                  className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-3"
                >
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <span className="text-xs font-medium text-slate-900 dark:text-white">
                      {review.menuItem?.name}
                    </span>
                    <RatingStars rating={review.rating} size="sm" />
                  </div>
                  {review.comment && (
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                      {review.comment}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
