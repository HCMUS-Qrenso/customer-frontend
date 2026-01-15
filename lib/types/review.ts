// Review Types - matching backend API

export interface ReviewerDTO {
  id: string;
  fullName: string;
  avatarUrl?: string;
}

export interface MenuItemBasicDTO {
  id: string;
  name: string;
  imageUrl?: string;
}

export interface ReviewResponseDTO {
  id: string;
  menuItemId?: string;
  menuItem?: MenuItemBasicDTO;
  customerId: string;
  customer: ReviewerDTO;
  orderId: string;
  rating: number;
  comment?: string;
  isVerifiedPurchase: boolean;
  status: string;
  reviewType: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReviewStatsDTO {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
}

export interface ItemReviewsResponseDTO {
  reviews: ReviewResponseDTO[];
  stats: ReviewStatsDTO;
  total: number;
  page: number;
  pageSize: number;
}

export interface CreateItemReviewDTO {
  orderId: string;
  menuItemId: string;
  rating: number;
  comment?: string;
}

export interface CreateOrderReviewDTO {
  orderId: string;
  rating: number;
  comment?: string;
}

export interface ReviewableItem {
  menuItemId: string;
  name: string;
  imageUrl?: string;
  quantity: number;
}

export interface ReviewableOrder {
  orderId: string;
  orderNumber: string;
  tableNumber: string;
  completedAt: string;
  totalAmount: number;
  hasOrderReview: boolean;
  reviewableItems: ReviewableItem[];
  totalItems: number;
  reviewedItems: number;
}

export interface MyReviewsResponse {
  reviews: ReviewResponseDTO[];
  total: number;
  page: number;
  pageSize: number;
}
