package com.lms.service;

import com.lms.dto.request.LessonRequest;
import com.lms.dto.response.LessonResponse;

import java.util.List;

/**
 * Business logic interface for Lesson management.
 */
public interface LessonService {

    /** Returns all active lessons for a given chapter, ordered by orderIndex */
    List<LessonResponse> getLessonsByChapter(String chapterId);

    /** Creates a new lesson */
    LessonResponse createLesson(LessonRequest request);

    /** Updates an existing lesson */
    LessonResponse updateLesson(String id, LessonRequest request);

    /** Soft-deletes a lesson */
    void deleteLesson(String id);
}
