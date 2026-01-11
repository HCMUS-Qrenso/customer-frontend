"use client";

import { useState } from "react";
import { Star, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCreateItemReview, useCreateOrderReview } from "@/hooks/use-reviews";
import type {
  CreateItemReviewDTO,
  CreateOrderReviewDTO,
} from "@/lib/types/review";
import { useLanguage } from "@/lib/i18n/context";

interface ReviewFormProps {
  orderId: string;
  menuItemId?: string;
  menuItemName?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function ReviewForm({
  orderId,
  menuItemId,
  menuItemName,
  onSuccess,
  onCancel,
}: ReviewFormProps) {
  const { t } = useLanguage();
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState("");

  const isItemReview = !!menuItemId;

  const itemReviewMutation = useCreateItemReview({ onSuccess });
  const orderReviewMutation = useCreateOrderReview({ onSuccess });

  const mutation = isItemReview ? itemReviewMutation : orderReviewMutation;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      return;
    }

    if (isItemReview && menuItemId) {
      const data: CreateItemReviewDTO = {
        orderId,
        menuItemId,
        rating,
        comment: comment.trim() || undefined,
      };
      itemReviewMutation.mutate(data);
    } else {
      const data: CreateOrderReviewDTO = {
        orderId,
        rating,
        comment: comment.trim() || undefined,
      };
      orderReviewMutation.mutate(data);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {menuItemName && (
        <div className="text-sm text-slate-600 dark:text-slate-400">
          {t.review?.reviewFor || "Review for"}:{" "}
          <span className="font-semibold text-slate-900 dark:text-white">
            {menuItemName}
          </span>
        </div>
      )}

      {/* Star Rating */}
      <div>
        <label className="block text-sm font-medium text-slate-900 dark:text-white mb-2">
          {t.review?.yourRating || "Your Rating"} <span className="text-red-500">*</span>
        </label>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoveredRating(star)}
              onMouseLeave={() => setHoveredRating(0)}
              className="transition-transform hover:scale-110"
            >
              <Star
                className={`size-8 ${
                  star <= (hoveredRating || rating)
                    ? "fill-yellow-400 text-yellow-400"
                    : "fill-slate-200 text-slate-200 dark:fill-slate-700 dark:text-slate-700"
                }`}
              />
            </button>
          ))}
        </div>
        {rating > 0 && (
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {rating === 1 && (t.review?.rating1 || "Very Poor")}
            {rating === 2 && (t.review?.rating2 || "Poor")}
            {rating === 3 && (t.review?.rating3 || "Average")}
            {rating === 4 && (t.review?.rating4 || "Good")}
            {rating === 5 && (t.review?.rating5 || "Excellent")}
          </p>
        )}
      </div>

      {/* Comment */}
      <div>
        <label className="block text-sm font-medium text-slate-900 dark:text-white mb-2">
          {t.review?.commentLabel || "Comment (optional)"}
        </label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder={t.review?.commentPlaceholder || "Share your experience..."}
          rows={4}
          maxLength={500}
          className="w-full resize-none rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-3 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
        />
        <div className="text-xs text-slate-400 dark:text-slate-500 mt-1 text-right">
          {comment.length}/500
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <Button
          type="submit"
          disabled={rating === 0 || mutation.isPending}
          className="flex-1"
        >
          {mutation.isPending ? (
            <>
              <Loader2 className="size-4 animate-spin mr-2" />
              {t.review?.submitting || "Submitting..."}
            </>
          ) : (
            t.review?.submit || "Submit Review"
          )}
        </Button>
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            {t.review?.cancel || "Cancel"}
          </Button>
        )}
      </div>
    </form>
  );
}
