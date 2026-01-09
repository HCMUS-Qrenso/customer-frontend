import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { reviewApi } from "@/lib/api/review";
import { toast } from "sonner";
import type {
  CreateItemReviewDTO,
  CreateOrderReviewDTO,
  ItemReviewsResponseDTO,
  ReviewResponseDTO,
  ReviewableOrder,
  MyReviewsResponse,
} from "@/lib/types/review";

// ============================================
// Query Hooks
// ============================================

/**
 * Get reviews for a specific menu item
 */
export function useItemReviews(
  menuItemId: string,
  page: number = 1,
  pageSize: number = 10,
) {
  return useQuery<ItemReviewsResponseDTO>({
    queryKey: ["item-reviews", menuItemId, page],
    queryFn: () => reviewApi.getItemReviews(menuItemId, page, pageSize),
  });
}

/**
 * Get reviews for a specific order
 */
export function useOrderReviews(orderId: string) {
  return useQuery<ReviewResponseDTO[]>({
    queryKey: ["order-reviews", orderId],
    queryFn: () => reviewApi.getOrderReviews(orderId),
  });
}

/**
 * Get current user's reviews
 */
export function useMyReviews(page: number = 1, pageSize: number = 10) {
  return useQuery<MyReviewsResponse>({
    queryKey: ["my-reviews", page],
    queryFn: () => reviewApi.getMyReviews(page, pageSize),
  });
}

/**
 * Get orders that can be reviewed by current user
 */
export function useReviewableOrders(enabled: boolean = true) {
  return useQuery<ReviewableOrder[]>({
    queryKey: ["reviewable-orders"],
    queryFn: () => reviewApi.getReviewableOrders(),
    enabled,
  });
}

// ============================================
// Mutation Hooks
// ============================================

interface UseCreateItemReviewOptions {
  onSuccess?: () => void;
  onError?: (error: unknown) => void;
}

/**
 * Create a review for a menu item
 */
export function useCreateItemReview(options?: UseCreateItemReviewOptions) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateItemReviewDTO) => {
      return reviewApi.createItemReview(data);
    },
    onSuccess: (_, variables) => {
      toast.success("Đánh giá của bạn đã được gửi thành công!");
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ["reviewable-orders"] });
      queryClient.invalidateQueries({ 
        queryKey: ["order-reviews", variables.orderId] 
      });
      queryClient.invalidateQueries({ 
        queryKey: ["item-reviews", variables.menuItemId] 
      });
      // Invalidate menu queries to update ratings
      queryClient.invalidateQueries({ queryKey: ["menu"] });
      
      options?.onSuccess?.();
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(
        err.response?.data?.message || 
        "Không thể gửi đánh giá. Vui lòng thử lại."
      );
      options?.onError?.(error);
    },
  });
}

interface UseCreateOrderReviewOptions {
  onSuccess?: () => void;
  onError?: (error: unknown) => void;
}

/**
 * Create a review for an order
 */
export function useCreateOrderReview(options?: UseCreateOrderReviewOptions) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateOrderReviewDTO) => {
      return reviewApi.createOrderReview(data);
    },
    onSuccess: (_, variables) => {
      toast.success("Đánh giá của bạn đã được gửi thành công!");
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ["reviewable-orders"] });
      queryClient.invalidateQueries({ 
        queryKey: ["order-reviews", variables.orderId] 
      });
      // Invalidate menu queries to update ratings
      queryClient.invalidateQueries({ queryKey: ["menu"] });
      
      options?.onSuccess?.();
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(
        err.response?.data?.message || 
        "Không thể gửi đánh giá. Vui lòng thử lại."
      );
      options?.onError?.(error);
    },
  });
}
