package com.lms.service;

import com.lms.dto.response.MediaResourceResponse;
import org.springframework.core.io.Resource;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

/**
 * Business logic interface for MediaResource management.
 */
public interface MediaResourceService {

    /** Returns all media resources for a lesson */
    List<MediaResourceResponse> getResourcesByLesson(String lessonId);

    /**
     * Saves a VIDEO record using an embed URL (YouTube / Vimeo).
     *
     * @param lessonId target lesson
     * @param videoUrl embed URL
     */
    MediaResourceResponse addVideoLink(String lessonId, String videoUrl);

    /**
     * Saves a DOCUMENT by uploading a file (PDF / DOCX).
     *
     * @param lessonId target lesson
     * @param file     uploaded file
     */
    MediaResourceResponse uploadDocument(String lessonId, MultipartFile file) throws IOException;

    /**
     * Loads the file as a Spring Resource for streaming download.
     *
     * @param resourceId ID of the MediaResource document
     */
    Resource loadFileAsResource(String resourceId) throws IOException;

    /**
     * Returns the MediaResource document by ID (to resolve metadata for download)
     */
    MediaResourceResponse getResourceById(String resourceId);

    /** Deletes a media resource record (and its physical file if document) */
    void deleteResource(String resourceId) throws IOException;
}
