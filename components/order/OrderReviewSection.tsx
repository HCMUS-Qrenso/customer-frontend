"use client";

import { useState } from "react";
import {
  MessageSquarePlus,
  ChevronDown,
  ChevronUp,
  Loader2,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ReviewForm } from "@/components/order/ReviewForm";
import { useReviewableOrders } from "@/hooks/use-reviews";
import { useAuthStore } from "@/lib/stores/auth-store";
import { useLanguage } from "@/lib/i18n/context";

interface OrderReviewSectionProps {
  orderId: string;
}

export function OrderReviewSection({ orderId }: OrderReviewSectionProps) {
  const { t } = useLanguage();
  const { isAuthenticated } = useAuthStore();
  const [expandedOrder, setExpandedOrder] = useState(false);
  const [reviewingItem, setReviewingItem] = useState<string | null>(null);
  const [reviewingOrder, setReviewingOrder] = useState(false);

  const { data: reviewableOrders, isLoading } =
    useReviewableOrders(isAuthenticated);

  if (!isAuthenticated) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-4">
        <Loader2 className="size-6 animate-spin text-emerald-500" />
      </div>
    );
  }

  const order = reviewableOrders?.find((o) => o.orderId === orderId);

  if (!order) {
    return null;
  }

  const hasReviewableItems = order.reviewableItems.length > 0;
  const hasOrderReview = order.hasOrderReview;
  const canReview = hasReviewableItems || !hasOrderReview;

  if (!canReview) {
    return (
      <div className="rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4">
        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
          <Star className="size-4 fill-yellow-400 text-yellow-400" />
          <span>{t.review?.alreadyReviewed || "You have already reviewed this order"}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
          <MessageSquarePlus className="size-5" />
          {t.review?.title || "Review Order"}
        </h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setExpandedOrder(!expandedOrder)}
        >
          {expandedOrder ? (
            <ChevronUp className="size-4" />
          ) : (
            <ChevronDown className="size-4" />
          )}
        </Button>
      </div>

      {expandedOrder && (
        <div className="space-y-4">
          {/* Order Review */}
          {!hasOrderReview && (
            <div className="border-t border-gray-200 dark:border-slate-700 pt-4">
            <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-slate-900 dark:text-white">
                  {t.review?.overall || "Overall Review"}
                </h4>
                {!reviewingOrder && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setReviewingOrder(true)}
                  >
                    {t.review?.writeReview || "Write Review"}
                  </Button>
                )}
              </div>
              {reviewingOrder && (
                <ReviewForm
                  orderId={orderId}
                  onSuccess={() => setReviewingOrder(false)}
                  onCancel={() => setReviewingOrder(false)}
                />
              )}
            </div>
          )}

          {/* Item Reviews */}
          {hasReviewableItems && (
            <div className="border-t border-gray-200 dark:border-slate-700 pt-4">
              <h4 className="font-medium text-slate-900 dark:text-white mb-3">
                {t.review?.itemReviews || "Item Reviews"} ({order.reviewedItems}/{order.totalItems})
              </h4>
              <div className="space-y-3">
                {order.reviewableItems.map((item) => (
                  <div
                    key={item.menuItemId}
                    className="border border-gray-200 dark:border-slate-700 rounded-lg p-3"
                  >
                    <div className="flex items-start gap-3">
                      {item.imageUrl && (
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="size-16 rounded-lg object-cover"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h5 className="font-medium text-slate-900 dark:text-white">
                              {item.name}
                            </h5>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                              {t.review?.quantity || "Quantity"}: {item.quantity}
                            </p>
                          </div>
                          {reviewingItem !== item.menuItemId && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setReviewingItem(item.menuItemId)}
                            >
                              {t.review?.writeReview || "Write Review"}
                            </Button>
                          )}
                        </div>
                        {reviewingItem === item.menuItemId && (
                          <div className="mt-3">
                            <ReviewForm
                              orderId={orderId}
                              menuItemId={item.menuItemId}
                              menuItemName={item.name}
                              onSuccess={() => setReviewingItem(null)}
                              onCancel={() => setReviewingItem(null)}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
