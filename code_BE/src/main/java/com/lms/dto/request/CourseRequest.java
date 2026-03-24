package com.lms.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.Data;

/**
 * Request DTO for creating or updating a Course.
 */
@Data
public class CourseRequest {

    @NotBlank(message = "Title must not be blank")
    private String title;

    private String description;

    @PositiveOrZero(message = "Price must be 0 or positive")
    private Double price;

    /** URL or path for the cover image */
    private String coverImage;

    /** ID of the instructor owning the course */
    private String instructorId;
}
