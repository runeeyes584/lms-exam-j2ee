import api from '@/lib/api';
import type { ApiResponse, Course } from '@/types/types';

export interface CourseRequest {
  title: string;
  description: string;
  price: number;
  coverImage?: string;
  tags?: string[];
  isPublished?: boolean;
  instructorId?: string;
}

export type CourseResponse = Omit<Course, 'instructor'> & {
  instructor?: {
    id: string;
    fullName: string;
    avatarUrl?: string;
  };
  enrollmentCount?: number;
  rating?: number;
  chaptersCount?: number;
  isDeleted?: boolean;
};

export type CourseStatusFilter = 'all' | 'published' | 'draft' | 'deleted';

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

const normalizeCourse = (course: any): CourseResponse => ({
  ...course,
  description: course?.description ?? '',
  price: Number(course?.price ?? 0),
  tags: Array.isArray(course?.tags) ? course.tags : [],
  isPublished: Boolean(course?.isPublished),
  isDeleted: Boolean(course?.isDeleted),
});

export const courseService = {
  // Get all courses (public)
  getAll: async (): Promise<ApiResponse<CourseResponse[]>> => {
    const response = await api.get('/v1/courses');
    return {
      ...response.data,
      result: (response.data.result || []).map(normalizeCourse),
    };
  },

  // Get course by ID
  getById: async (id: string): Promise<ApiResponse<CourseResponse>> => {
    const response = await api.get(`/v1/courses/${id}`);
    return {
      ...response.data,
      result: response.data.result ? normalizeCourse(response.data.result) : response.data.result,
    };
  },

  // Create course (Instructor)
  create: async (data: CourseRequest): Promise<ApiResponse<CourseResponse>> => {
    const response = await api.post('/v1/courses', data);
    return {
      ...response.data,
      result: response.data.result ? normalizeCourse(response.data.result) : response.data.result,
    };
  },

  // Update course (Instructor)
  update: async (id: string, data: CourseRequest): Promise<ApiResponse<CourseResponse>> => {
    const response = await api.put(`/v1/courses/${id}`, data);
    return {
      ...response.data,
      result: response.data.result ? normalizeCourse(response.data.result) : response.data.result,
    };
  },

  // Delete course (Instructor)
  delete: async (id: string): Promise<ApiResponse<void>> => {
    const response = await api.delete(`/v1/courses/${id}`);
    return response.data;
  },

  // Get instructor's courses
  getMyCourses: async (instructorId: string): Promise<ApiResponse<CourseResponse[]>> => {
    try {
      const response = await api.get(`/v1/courses/instructor/${instructorId}`);
      const ownedCourses = (response.data.result || []).map(normalizeCourse);
      if (ownedCourses.length > 0) {
        return {
          ...response.data,
          result: ownedCourses,
        };
      }
    } catch {
      // Fallback to legacy behavior below.
    }

    const fallbackResponse = await api.get('/v1/courses');
    const allCourses: CourseResponse[] = (fallbackResponse.data.result || []).map(normalizeCourse);
    const ownedCourses = allCourses.filter(course =>
      course.instructorId === instructorId || course.instructor?.id === instructorId
    );

    return {
      ...fallbackResponse.data,
      result: ownedCourses.length > 0 ? ownedCourses : allCourses,
    };
  },

  // Get instructor's courses (strict, no fallback to all courses)
  getMyCoursesStrict: async (instructorId: string): Promise<ApiResponse<CourseResponse[]>> => {
    try {
      const response = await api.get(`/v1/courses/instructor/${instructorId}`);
      return {
        ...response.data,
        result: (response.data.result || []).map(normalizeCourse),
      };
    } catch {
      const fallbackResponse = await api.get('/v1/courses');
      const allCourses: CourseResponse[] = (fallbackResponse.data.result || []).map(normalizeCourse);
      const ownedCourses = allCourses.filter(course =>
        course.instructorId === instructorId || course.instructor?.id === instructorId
      );
      return {
        ...fallbackResponse.data,
        result: ownedCourses,
      };
    }
  },
};

// Chapter Service
export interface ChapterRequest {
  courseId: string;
  title: string;
  description?: string;
  orderIndex: number;
}

export interface ChapterResponse {
  id: string;
  courseId: string;
  title: string;
  description?: string;
  orderIndex: number;
  lessonsCount?: number;
  createdAt: string;
  updatedAt: string;
}

export const chapterService = {
  // Get chapters by course
  getByCourse: async (courseId: string): Promise<ApiResponse<ChapterResponse[]>> => {
    const response = await api.get(`/v1/courses/${courseId}/chapters`);
    return response.data;
  },

  // Create chapter
  create: async (data: ChapterRequest): Promise<ApiResponse<ChapterResponse>> => {
    const response = await api.post('/v1/chapters', data);
    return response.data;
  },

  // Update chapter
  update: async (id: string, data: ChapterRequest): Promise<ApiResponse<ChapterResponse>> => {
    const response = await api.put(`/v1/chapters/${id}`, data);
    return response.data;
  },

  // Delete chapter
  delete: async (id: string): Promise<ApiResponse<void>> => {
    const response = await api.delete(`/v1/chapters/${id}`);
    return response.data;
  },
};

// Lesson Service
export interface LessonRequest {
  chapterId: string;
  title: string;
  content?: string;
  videoUrl?: string;
  orderIndex: number;
  duration?: number;
}

export interface LessonResponse {
  id: string;
  chapterId: string;
  title: string;
  content?: string;
  videoUrl?: string;
  orderIndex: number;
  duration?: number;
  createdAt: string;
  updatedAt: string;
}

export const lessonService = {
  // Get lessons by chapter
  getByChapter: async (chapterId: string): Promise<ApiResponse<LessonResponse[]>> => {
    const response = await api.get(`/v1/chapters/${chapterId}/lessons`);
    return response.data;
  },

  // Create lesson
  create: async (data: LessonRequest): Promise<ApiResponse<LessonResponse>> => {
    const response = await api.post('/v1/lessons', data);
    return response.data;
  },

  // Update lesson
  update: async (id: string, data: LessonRequest): Promise<ApiResponse<LessonResponse>> => {
    const response = await api.put(`/v1/lessons/${id}`, data);
    return response.data;
  },

  // Delete lesson
  delete: async (id: string): Promise<ApiResponse<void>> => {
    const response = await api.delete(`/v1/lessons/${id}`);
    return response.data;
  },
};

export default courseService;
