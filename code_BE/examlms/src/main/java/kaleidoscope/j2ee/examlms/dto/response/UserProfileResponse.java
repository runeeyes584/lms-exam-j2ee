package kaleidoscope.j2ee.examlms.dto.response;

import kaleidoscope.j2ee.examlms.entity.enums.Gender;
import kaleidoscope.j2ee.examlms.entity.enums.Role;
import lombok.Builder;

@Builder
public record UserProfileResponse(
                String id,
                String email,
                String fullName,
                String avatarUrl,
                Role role,
                String phoneNumber,
                String dateOfBirth,
                String address,
                Gender gender,
                String schoolId) {
}