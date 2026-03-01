package com.lms.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

/**
 * Represents a Course in the LMS system.
 * Supports soft-delete via the isDeleted flag.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "courses")
public class Course {

    @Id
    private String id;

    private String title;

    private String description;

    private Double price;

    /** URL or path to the cover image */
    private String coverImage;

    /** ID of the instructor who owns this course */
    private String instructorId;

    /** Soft-delete flag — true means this course is logically deleted */
    @Builder.Default
    private boolean isDeleted = false;

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;
}
