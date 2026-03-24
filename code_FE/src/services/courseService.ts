import api from './api';
import type { ApiResponse, Course } from '../types/backend';

const BASE = '/courses';

export const courseService = {
    getAll: () =>
        api.get<ApiResponse<Course[]>>(BASE).then((r) => r.data.result),

    getById: (id: string) =>
        api.get<ApiResponse<Course>>(`${BASE}/${id}`).then((r) => r.data.result),

    create: (data: {
        title: string;
        description?: string;
        price?: number;
        coverImage?: string;
        instructorId?: string;
    }) => api.post<ApiResponse<Course>>(BASE, data).then((r) => r.data.result),

    update: (
        id: string,
        data: {
            title: string;
            description?: string;
            price?: number;
            coverImage?: string;
            instructorId?: string;
        }
    ) =>
        api
            .put<ApiResponse<Course>>(`${BASE}/${id}`, data)
            .then((r) => r.data.result),

    delete: (id: string) =>
        api.delete<ApiResponse<void>>(`${BASE}/${id}`).then((r) => r.data),
};
