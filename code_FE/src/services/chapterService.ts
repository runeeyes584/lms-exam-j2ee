import api from './api';
import type { ApiResponse, Chapter } from '../types/backend';

export const chapterService = {
    getByCourse: (courseId: string) =>
        api
            .get<ApiResponse<Chapter[]>>(`/courses/${courseId}/chapters`)
            .then((r) => r.data.result),

    create: (data: { courseId: string; title: string; orderIndex?: number }) =>
        api.post<ApiResponse<Chapter>>('/chapters', data).then((r) => r.data.result),

    update: (
        id: string,
        data: { courseId: string; title: string; orderIndex?: number }
    ) =>
        api
            .put<ApiResponse<Chapter>>(`/chapters/${id}`, data)
            .then((r) => r.data.result),

    delete: (id: string) =>
        api.delete<ApiResponse<void>>(`/chapters/${id}`).then((r) => r.data),
};
