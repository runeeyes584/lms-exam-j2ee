package com.lms.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * Request DTO for creating or updating a Lesson.
 */
@Data
public class LessonRequest {

    @NotBlank(message = "Chapter ID must not be blank")
    private String chapterId;

    @NotBlank(message = "Title must not be blank")
    private String title;

    /** Optional rich-text or markdown lesson content */
    private String content;

    private int orderIndex;
}
