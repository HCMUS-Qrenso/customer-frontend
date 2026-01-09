"use client";

import { Star } from "lucide-react";
import { ReviewStatsDTO } from "@/lib/types/review";

interface RatingStarsProps {
  rating: number;
  size?: "sm" | "md" | "lg";
  showNumber?: boolean;
}

export function RatingStars({
  rating,
  size = "md",
  showNumber = false,
}: RatingStarsProps) {
  const sizeClasses = {
    sm: "size-3",
    md: "size-4",
    lg: "size-5",
  };

  const textClasses = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
  };

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`${sizeClasses[size]} ${
            star <= Math.round(rating)
              ? "fill-yellow-400 text-yellow-400"
              : "fill-slate-200 text-slate-200 dark:fill-slate-700 dark:text-slate-700"
          }`}
        />
      ))}
      {showNumber && (
        <span
          className={`font-medium text-slate-700 dark:text-slate-300 ${textClasses[size]} ml-1`}
        >
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
}

interface RatingDistributionProps {
  stats: ReviewStatsDTO;
}

export function RatingDistribution({ stats }: RatingDistributionProps) {
  const { averageRating, totalReviews, ratingDistribution } = stats;

  return (
    <div className="rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6">
      <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
        Đánh giá & Nhận xét
      </h3>

      <div className="flex items-start gap-8">
        {/* Average Rating */}
        <div className="flex flex-col items-center">
          <div className="text-5xl font-bold text-slate-900 dark:text-white">
            {averageRating.toFixed(1)}
          </div>
          <RatingStars rating={averageRating} size="md" />
          <div className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {totalReviews} đánh giá
          </div>
        </div>

        {/* Rating Distribution */}
        <div className="flex-1 space-y-2">
          {[5, 4, 3, 2, 1].map((star) => {
            const count =
              ratingDistribution[star as keyof typeof ratingDistribution] || 0;
            const percentage =
              totalReviews > 0 ? (count / totalReviews) * 100 : 0;

            return (
              <div key={star} className="flex items-center gap-2">
                <span className="text-sm text-slate-600 dark:text-slate-400 w-8">
                  {star}{" "}
                  <Star className="inline size-3 fill-yellow-400 text-yellow-400" />
                </span>
                <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-yellow-400"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="text-sm text-slate-500 dark:text-slate-400 w-12 text-right">
                  {count}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
