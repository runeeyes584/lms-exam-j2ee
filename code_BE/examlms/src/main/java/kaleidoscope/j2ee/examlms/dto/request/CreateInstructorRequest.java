package kaleidoscope.j2ee.examlms.dto.request;

import jakarta.validation.constraints.Size;

public record CreateInstructorRequest(
                @Size(max = 500, message = "Note must be at most 500 characters") String note) {
}