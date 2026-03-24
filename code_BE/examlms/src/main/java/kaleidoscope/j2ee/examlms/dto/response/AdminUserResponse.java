package kaleidoscope.j2ee.examlms.dto.response;

import java.time.Instant;

import kaleidoscope.j2ee.examlms.entity.enums.Role;
import lombok.Builder;

@Builder
public record AdminUserResponse(
        String id,
        String email,
        String fullName,
        Role role,
        Boolean isActive,
        Instant createdAt,
        Instant updatedAt) {
}
