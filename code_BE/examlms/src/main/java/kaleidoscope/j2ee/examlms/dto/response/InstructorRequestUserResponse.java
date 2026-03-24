package kaleidoscope.j2ee.examlms.dto.response;

import kaleidoscope.j2ee.examlms.entity.enums.Role;
import lombok.Builder;

@Builder
public record InstructorRequestUserResponse(
        String id,
        String email,
        String fullName,
        Role role,
        Boolean isActive) {
}
