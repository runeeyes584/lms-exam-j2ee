package kaleidoscope.j2ee.examlms.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class EnrollmentRequest {

    @NotBlank(message = "userId is required")
    private String userId;

    @NotBlank(message = "courseId is required")
    private String courseId;
}