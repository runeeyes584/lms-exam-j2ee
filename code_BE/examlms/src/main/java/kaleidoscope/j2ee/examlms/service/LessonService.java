package kaleidoscope.j2ee.examlms.service;

import java.util.List;

import kaleidoscope.j2ee.examlms.dto.request.LessonRequest;
import kaleidoscope.j2ee.examlms.dto.response.LessonResponse;

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
