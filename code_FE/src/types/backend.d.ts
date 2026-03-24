// Type definitions mapping to the Spring Boot backend DTOs

export interface ApiResponse<T> {
    code: number;
    message: string;
    result: T;
}

export interface Course {
    id: string;
    title: string;
    description: string;
    price: number;
    coverImage: string;
    instructorId: string;
    isDeleted: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface Chapter {
    id: string;
    courseId: string;
    title: string;
    orderIndex: number;
    isDeleted: boolean;
}

export interface Lesson {
    id: string;
    chapterId: string;
    title: string;
    content: string;
    orderIndex: number;
    isDeleted: boolean;
}

export type MediaType = 'VIDEO' | 'DOCUMENT';

export interface MediaResource {
    id: string;
    lessonId: string;
    type: MediaType;
    url: string;
    originalFileName: string;
    mimeType: string;
    downloadUrl: string;
}
