package kaleidoscope.j2ee.examlms.dto.response;

import kaleidoscope.j2ee.examlms.entity.enums.Role;
import lombok.Builder;

@Builder
public record UserPublicResponse(
                String id,
                String email,
                String fullName,
                String avatarUrl,
                Role role) {
}