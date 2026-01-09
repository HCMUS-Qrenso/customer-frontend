import { apiClient } from "./client";
import type {
  CreateItemReviewDTO,
  CreateOrderReviewDTO,
  ReviewResponseDTO,
  ItemReviewsResponseDTO,
  ReviewableOrder,
  MyReviewsResponse,
} from "../types/review";

export const reviewApi = {
  // Create a review for a menu item
  createItemReview: async (
    data: CreateItemReviewDTO,
  ): Promise<ReviewResponseDTO> => {
    const response = await apiClient.post<ReviewResponseDTO>(
      "/reviews/items",
      data,
    );
    return response.data;
  },

  // Create a review for an order
  createOrderReview: async (
    data: CreateOrderReviewDTO,
  ): Promise<ReviewResponseDTO> => {
    const response = await apiClient.post<ReviewResponseDTO>(
      "/reviews/orders",
      data,
    );
    return response.data;
  },

  // Get all reviews for a specific menu item
  getItemReviews: async (
    menuItemId: string,
    page: number = 1,
    pageSize: number = 10,
  ): Promise<ItemReviewsResponseDTO> => {
    const response = await apiClient.get<ItemReviewsResponseDTO>(
      `/reviews/items/${menuItemId}`,
      {
        params: { page, pageSize },
      },
    );
    return response.data;
  },

  // Get all reviews for a specific order
  getOrderReviews: async (orderId: string): Promise<ReviewResponseDTO[]> => {
    const response = await apiClient.get<ReviewResponseDTO[]>(
      `/reviews/orders/${orderId}`,
    );
    return response.data;
  },

  // Get all reviews by the current user
  getMyReviews: async (
    page: number = 1,
    pageSize: number = 10,
  ): Promise<MyReviewsResponse> => {
    const response = await apiClient.get<MyReviewsResponse>(
      "/reviews/my-reviews",
      {
        params: { page, pageSize },
      },
    );
    return response.data;
  },

  // Get orders that can be reviewed
  getReviewableOrders: async (): Promise<ReviewableOrder[]> => {
    const response = await apiClient.get<ReviewableOrder[]>(
      "/reviews/reviewable-orders",
    );
    return response.data;
  },
};
