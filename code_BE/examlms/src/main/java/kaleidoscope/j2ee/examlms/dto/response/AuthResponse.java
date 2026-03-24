package kaleidoscope.j2ee.examlms.dto.response;

import lombok.Builder;

@Builder
public record AuthResponse(
                String accessToken,
                String refreshToken,
                UserPublicResponse user) {
}