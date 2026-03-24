import api from '@/lib/api';
import type { ApiResponse } from '@/types/types';
import type { PageResponse } from './courseService';

// Comment Service
export interface CommentRequest {
  courseId: string;
  lessonId?: string;
  parentId?: string;
  content: string;
}

export interface CommentResponse {
  id: string;
  courseId: string;
  lessonId?: string;
  parentId?: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  repliesCount: number;
  createdAt: string;
  updatedAt: string;
}

export const commentService = {
  // Create comment
  create: async (data: CommentRequest): Promise<ApiResponse<CommentResponse>> => {
    const response = await api.post('/comments', data);
    return response.data;
  },

  // Get comments by course
  getByCourse: async (
    courseId: string,
    lessonId?: string,
    page = 0,
    size = 10
  ): Promise<ApiResponse<PageResponse<CommentResponse>>> => {
    const response = await api.get(`/comments/course/${courseId}`, {
      params: { lessonId, page, size },
    });
    return response.data;
  },

  // Get comment by ID
  getById: async (id: string): Promise<ApiResponse<CommentResponse>> => {
    const response = await api.get(`/comments/${id}`);
    return response.data;
  },

  // Get replies
  getReplies: async (commentId: string): Promise<ApiResponse<CommentResponse[]>> => {
    const response = await api.get(`/comments/${commentId}/replies`);
    return response.data;
  },

  // Update comment
  update: async (id: string, userId: string, content: string): Promise<ApiResponse<CommentResponse>> => {
    const response = await api.put(`/comments/${id}`, { userId, content });
    return response.data;
  },

  // Delete comment
  delete: async (id: string, userId: string): Promise<ApiResponse<void>> => {
    const response = await api.delete(`/comments/${id}`, { params: { userId } });
    return response.data;
  },
};

// Review Service
export interface ReviewRequest {
  courseId: string;
  rating: number;
  comment: string;
}

export interface ReviewResponse {
  id: string;
  courseId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  comment: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReviewStats {
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

export const reviewService = {
  // Create review
  create: async (data: ReviewRequest): Promise<ApiResponse<ReviewResponse>> => {
    const response = await api.post('/reviews', data);
    return response.data;
  },

  // Get reviews by course
  getByCourse: async (
    courseId: string,
    page = 0,
    size = 10
  ): Promise<ApiResponse<PageResponse<ReviewResponse>>> => {
    const response = await api.get(`/reviews/course/${courseId}`, { params: { page, size } });
    return response.data;
  },

  // Get review stats
  getStats: async (courseId: string): Promise<ApiResponse<ReviewStats>> => {
    const response = await api.get(`/reviews/course/${courseId}/stats`);
    return response.data;
  },

  // Get review by ID
  getById: async (id: string): Promise<ApiResponse<ReviewResponse>> => {
    const response = await api.get(`/reviews/${id}`);
    return response.data;
  },

  // Update review
  update: async (
    id: string,
    userId: string,
    rating: number,
    comment: string
  ): Promise<ApiResponse<ReviewResponse>> => {
    const response = await api.put(`/reviews/${id}`, { userId, rating, comment });
    return response.data;
  },

  // Delete review
  delete: async (id: string, userId: string): Promise<ApiResponse<void>> => {
    const response = await api.delete(`/reviews/${id}`, { params: { userId } });
    return response.data;
  },
};

export default commentService;
