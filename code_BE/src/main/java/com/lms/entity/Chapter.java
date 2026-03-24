package com.lms.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

/**
 * Represents a Chapter inside a Course.
 * Chapters are ordered by orderIndex within a course.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "chapters")
public class Chapter {

    @Id
    private String id;

    /** Reference to the parent course */
    private String courseId;

    private String title;

    /** Determines the display order within the course (1-based) */
    private int orderIndex;

    /** Soft-delete flag */
    @Builder.Default
    private boolean isDeleted = false;
}
