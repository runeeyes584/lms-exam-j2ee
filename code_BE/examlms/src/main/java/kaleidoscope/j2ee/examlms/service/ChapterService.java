package kaleidoscope.j2ee.examlms.service;

import java.util.List;

import kaleidoscope.j2ee.examlms.dto.request.ChapterRequest;
import kaleidoscope.j2ee.examlms.dto.response.ChapterResponse;

/**
 * Business logic interface for Chapter management.
 */
public interface ChapterService {

    /** Returns all active chapters for a given course, ordered by orderIndex */
    List<ChapterResponse> getChaptersByCourse(String courseId);

    /** Creates a new chapter */
    ChapterResponse createChapter(ChapterRequest request);

    /** Updates an existing chapter */
    ChapterResponse updateChapter(String id, ChapterRequest request);

    /** Soft-deletes a chapter */
    void deleteChapter(String id);
}
