package com.lms.service;

import com.lms.dto.request.ChapterRequest;
import com.lms.dto.response.ChapterResponse;

import java.util.List;

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
