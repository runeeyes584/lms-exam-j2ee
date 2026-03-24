package kaleidoscope.j2ee.examlms.dto.request;

import jakarta.validation.constraints.NotBlank;

public record LogoutRequest(
                @NotBlank(message = "Refresh token is required") String refreshToken) {
}
