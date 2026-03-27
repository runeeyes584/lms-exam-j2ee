import api from '@/lib/api';
import type { ApiResponse } from '@/types/types';

export interface CertificateResponse {
  id: string;
  userId: string;
  courseId: string;
  courseName: string;
  studentName: string;
  issueDate: string;
  certificateNumber: string;
  filePath?: string;
}

export const certificateService = {
  // Generate certificate for user completion
  generate: async (courseId: string): Promise<ApiResponse<string>> => {
    const response = await api.get(`/certificates/${courseId}/generate`);
    return response.data;
  },

  // Get my certificates (assuming endpoint exists or will be added)
  getMyCertificates: async (): Promise<ApiResponse<CertificateResponse[]>> => {
    const response = await api.get('/certificates/my');
    return response.data;
  },

  // Verify certificate by number
  verify: async (certificateNumber: string): Promise<ApiResponse<CertificateResponse>> => {
    const response = await api.get(`/certificates/verify/${certificateNumber}`);
    return response.data;
  },

  // Download certificate as PDF
  download: async (certificateId: string): Promise<Blob> => {
    const response = await api.get(`/certificates/${certificateId}/download`, {
      responseType: 'blob'
    });
    return response.data;
  },
};

export default certificateService;
