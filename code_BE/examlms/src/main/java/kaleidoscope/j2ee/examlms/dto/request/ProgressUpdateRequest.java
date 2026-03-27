package kaleidoscope.j2ee.examlms.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ProgressUpdateRequest {

    @NotBlank(message = "userId is required")
    private String userId;

    @NotBlank(message = "courseId is required")
    private String courseId;

    @NotBlank(message = "lessonId is required")
    private String lessonId;

    private boolean completed;
    private int lastWatchedSecond;
}