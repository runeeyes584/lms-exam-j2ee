import api from './api';
import type { ApiResponse, MediaResource } from '../types/backend';

export const mediaService = {
    getByLesson: (lessonId: string) =>
        api
            .get<ApiResponse<MediaResource[]>>(`/lessons/${lessonId}/media`)
            .then((r) => r.data.result),

    addVideoLink: (lessonId: string, videoUrl: string) =>
        api
            .post<ApiResponse<MediaResource>>(`/lessons/${lessonId}/media/video`, {
                videoUrl,
            })
            .then((r) => r.data.result),

    uploadDocument: (lessonId: string, file: File) => {
        const form = new FormData();
        form.append('file', file);
        return api
            .post<ApiResponse<MediaResource>>(
                `/lessons/${lessonId}/media/document`,
                form,
                { headers: { 'Content-Type': 'multipart/form-data' } }
            )
            .then((r) => r.data.result);
    },

    delete: (id: string) =>
        api.delete<ApiResponse<void>>(`/media/${id}`).then((r) => r.data),
};
