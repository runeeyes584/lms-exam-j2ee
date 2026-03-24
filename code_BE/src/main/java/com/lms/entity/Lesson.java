package com.lms.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

/**
 * Represents a Lesson inside a Chapter.
 * Lessons are ordered by orderIndex within a chapter.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "lessons")
public class Lesson {

    @Id
    private String id;

    /** Reference to the parent chapter */
    private String chapterId;

    private String title;

    /** Optional rich-text / markdown content for the lesson */
    private String content;

    /** Determines the display order within the chapter (1-based) */
    private int orderIndex;

    /** Soft-delete flag */
    @Builder.Default
    private boolean isDeleted = false;
}
