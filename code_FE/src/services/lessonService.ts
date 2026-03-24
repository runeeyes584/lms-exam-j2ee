import api from './api';
import type { ApiResponse, Lesson } from '../types/backend';

export const lessonService = {
    getByChapter: (chapterId: string) =>
        api
            .get<ApiResponse<Lesson[]>>(`/chapters/${chapterId}/lessons`)
            .then((r) => r.data.result),

    create: (data: {
        chapterId: string;
        title: string;
        content?: string;
        orderIndex?: number;
    }) =>
        api.post<ApiResponse<Lesson>>('/lessons', data).then((r) => r.data.result),

    update: (
        id: string,
        data: {
            chapterId: string;
            title: string;
            content?: string;
            orderIndex?: number;
        }
    ) =>
        api
            .put<ApiResponse<Lesson>>(`/lessons/${id}`, data)
            .then((r) => r.data.result),

    delete: (id: string) =>
        api.delete<ApiResponse<void>>(`/lessons/${id}`).then((r) => r.data),
};
