package com.lms.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * Response DTO returned to the client for a Course object.
 */
@Data
@Builder
public class CourseResponse {
    private String id;
    private String title;
    private String description;
    private Double price;
    private String coverImage;
    private String instructorId;
    private boolean isDeleted;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
