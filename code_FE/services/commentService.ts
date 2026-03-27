import api from '@/lib/api';
import type { ApiResponse } from '@/types/types';
import type { PageResponse } from './courseService';

// Comment Service
export interface CommentRequest {
  courseId: string;
  lessonId?: string;
  parentId?: string;
  userId: string;
  userName?: string;
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

export interface DiscussionViewModel {
  id: string;
  title: string;
  content: string;
  author: {
    id: string;
    fullName: string;
    avatarUrl?: string;
  };
  courseId?: string;
  courseName?: string;
  createdAt: string;
  replyCount: number;
  likeCount: number;
  lastReplyAt?: string;
}

const buildDiscussionTitle = (content: string): string => {
  const normalized = content.trim();
  if (!normalized) return 'Bai thao luan';
  const firstLine = normalized.split(/\r?\n/)[0].trim();
  if (firstLine.length <= 80) return firstLine;
  return `${firstLine.slice(0, 77)}...`;
};

const buildDiscussionBody = (content: string): string => {
  const normalized = content.trim();
  if (!normalized) return '';

  const lines = normalized
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length <= 1) {
    // One-line content should not be duplicated under the title.
    return normalized.length > 80 ? normalized : '';
  }

  return lines.slice(1).join(' ');
};

export const mapCommentToDiscussion = (
  comment: CommentResponse,
  courseNameMap: Record<string, string> = {}
): DiscussionViewModel => ({
  id: comment.id,
  title: buildDiscussionTitle(comment.content || ''),
  content: buildDiscussionBody(comment.content || ''),
  author: {
    id: comment.userId || 'unknown',
    fullName: comment.userName || 'An danh',
    avatarUrl: comment.userAvatar,
  },
  courseId: comment.courseId,
  courseName: comment.courseId ? courseNameMap[comment.courseId] : undefined,
  createdAt: comment.createdAt || new Date().toISOString(),
  replyCount: Number(comment.repliesCount || 0),
  likeCount: 0,
  lastReplyAt: comment.updatedAt,
});

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

  getByCourseMapped: async (
    courseId: string,
    courseNameMap: Record<string, string> = {},
    lessonId?: string,
    page = 0,
    size = 10
  ): Promise<ApiResponse<PageResponse<DiscussionViewModel>>> => {
    const response = await commentService.getByCourse(courseId, lessonId, page, size);
    return {
      ...response,
      result: {
        ...response.result,
        content: (response.result?.content || []).map((comment) => mapCommentToDiscussion(comment, courseNameMap)),
      },
    };
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
  userId: string;
  userName?: string;
  userAvatar?: string;
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

export interface ReviewViewModel {
  id: string;
  courseId: string;
  user: {
    id: string;
    fullName: string;
    avatarUrl?: string;
  };
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

export const mapReviewToViewModel = (review: ReviewResponse): ReviewViewModel => ({
  id: review.id,
  courseId: review.courseId,
  user: {
    id: review.userId,
    fullName: review.userName || 'An danh',
    avatarUrl: review.userAvatar,
  },
  rating: Number(review.rating || 0),
  comment: review.comment || '',
  createdAt: review.createdAt,
  updatedAt: review.updatedAt,
});

const emptyDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

export const normalizeReviewStats = (raw: any): ReviewStats => {
  const ratingDistribution = raw?.ratingDistribution || raw?.distribution || {};
  return {
    averageRating: Number(raw?.averageRating || raw?.avgRating || 0),
    totalReviews: Number(raw?.totalReviews || raw?.count || 0),
    ratingDistribution: {
      1: Number(ratingDistribution[1] || ratingDistribution['1'] || emptyDistribution[1]),
      2: Number(ratingDistribution[2] || ratingDistribution['2'] || emptyDistribution[2]),
      3: Number(ratingDistribution[3] || ratingDistribution['3'] || emptyDistribution[3]),
      4: Number(ratingDistribution[4] || ratingDistribution['4'] || emptyDistribution[4]),
      5: Number(ratingDistribution[5] || ratingDistribution['5'] || emptyDistribution[5]),
    },
  };
};

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

  getByCourseMapped: async (
    courseId: string,
    page = 0,
    size = 10
  ): Promise<ApiResponse<PageResponse<ReviewViewModel>>> => {
    const response = await reviewService.getByCourse(courseId, page, size);
    return {
      ...response,
      result: {
        ...response.result,
        content: (response.result?.content || []).map(mapReviewToViewModel),
      },
    };
  },

  // Get review stats
  getStats: async (courseId: string): Promise<ApiResponse<ReviewStats>> => {
    const response = await api.get(`/reviews/course/${courseId}/stats`);
    return {
      ...response.data,
      result: normalizeReviewStats(response.data?.result),
    };
  },

  // Get review by ID
  getById: async (id: string): Promise<ApiResponse<ReviewResponse>> => {
    const response = await api.get(`/reviews/${id}`);
    return response.data;
  },

  getByIdMapped: async (id: string): Promise<ApiResponse<ReviewViewModel>> => {
    const response = await reviewService.getById(id);
    return {
      ...response,
      result: mapReviewToViewModel(response.result),
    };
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
