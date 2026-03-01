package com.lms.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * Request DTO for creating or updating a Chapter.
 */
@Data
public class ChapterRequest {

    @NotBlank(message = "Course ID must not be blank")
    private String courseId;

    @NotBlank(message = "Title must not be blank")
    private String title;

    private int orderIndex;
}
