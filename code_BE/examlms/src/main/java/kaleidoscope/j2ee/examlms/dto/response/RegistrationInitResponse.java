package kaleidoscope.j2ee.examlms.dto.response;

import lombok.Builder;

@Builder
public record RegistrationInitResponse(
        String email,
        int resendCooldownSeconds,
        int expiresInSeconds) {
}
