package kaleidoscope.j2ee.examlms.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Pattern;
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

    /** Optional video link */
    @Pattern(
            regexp = "^(https?://.*)?$",
            message = "Video URL must be a valid http/https URL")
    private String videoUrl;

    /** Optional duration in minutes */
    @Min(value = 0, message = "Duration must be greater than or equal to 0")
    private Integer duration;

    private int orderIndex;
}
