package com.lms.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

/**
 * Represents a media resource (video link or uploaded document) attached to a
 * lesson.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "media_resources")
public class MediaResource {

    @Id
    private String id;

    /** Reference to the parent lesson */
    private String lessonId;

    /** VIDEO or DOCUMENT */
    private MediaType type;

    /**
     * For VIDEO: holds the embed URL (YouTube/Vimeo).
     * For DOCUMENT: holds the server-side file path (relative to uploads/).
     */
    private String url;

    /** Original file name as uploaded by the user (for documents) */
    private String originalFileName;

    /** MIME type of the file, e.g. application/pdf */
    private String mimeType;

    public enum MediaType {
        VIDEO, DOCUMENT
    }
}
