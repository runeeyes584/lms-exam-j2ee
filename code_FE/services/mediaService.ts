import api from '@/lib/api';
import type { ApiResponse } from '@/types/types';

// Media Service
export interface MediaResourceResponse {
  id: string;
  lessonId: string;
  type: 'VIDEO' | 'DOCUMENT' | 'IMAGE';
  url: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  createdAt: string;
}

export const mediaService = {
  // Get media by lesson
  getByLesson: async (lessonId: string): Promise<ApiResponse<MediaResourceResponse[]>> => {
    const response = await api.get(`/v1/lessons/${lessonId}/media`);
    return response.data;
  },

  // Add video URL
  addVideo: async (lessonId: string, videoUrl: string): Promise<ApiResponse<MediaResourceResponse>> => {
    const response = await api.post(`/v1/lessons/${lessonId}/media/video`, { videoUrl });
    return response.data;
  },

  // Upload document
  uploadDocument: async (lessonId: string, file: File): Promise<ApiResponse<MediaResourceResponse>> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post(`/v1/lessons/${lessonId}/media/document`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  // Download media
  download: async (mediaId: string): Promise<Blob> => {
    const response = await api.get(`/v1/media/${mediaId}/download`, {
      responseType: 'blob',
    });
    return response.data;
  },

  // Delete media
  delete: async (mediaId: string): Promise<ApiResponse<void>> => {
    const response = await api.delete(`/v1/media/${mediaId}`);
    return response.data;
  },
};

// Certificate Service
export const certificateService = {
  // Get certificate (generates if not exists)
  get: async (userId: string, courseId: string): Promise<ApiResponse<string>> => {
    const response = await api.get(`/certificates/${userId}/${courseId}`);
    return response.data;
  },

  // Download certificate PDF
  download: async (userId: string, courseId: string): Promise<Blob> => {
    const response = await api.get(`/certificates/${userId}/${courseId}/download`, {
      responseType: 'blob',
    });
    return response.data;
  },
};

// VNPay Payment Service
export interface PaymentResult {
  success: boolean;
  message: string;
  transactionId?: string;
  amount?: number;
}

export const paymentService = {
  // Create payment URL
  createPayment: async (userId: string, courseId: string): Promise<string> => {
    const response = await api.post('/vnpay/create', null, {
      params: { userId, courseId },
    });
    return response.data;
  },

  // Verify payment (usually handled by backend callback)
  verifyPayment: async (params: Record<string, string>): Promise<PaymentResult> => {
    const response = await api.get('/vnpay/return', { params });
    return response.data;
  },
};

// Health Check Service
export const healthService = {
  check: async (): Promise<ApiResponse<{ status: string; timestamp: string }>> => {
    const response = await api.get('/health');
    return response.data;
  },
};

export default mediaService;
