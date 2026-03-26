package kaleidoscope.j2ee.examlms.dto.response;

import java.time.LocalDateTime;

import lombok.Builder;
import lombok.Data;

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
    private Double avgRating;
    private Integer ratingCount;
    private boolean isDeleted;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
