package kaleidoscope.j2ee.examlms.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record ResendRegistrationOtpRequest(
        @NotBlank(message = "Email required") @Email(message = "Email invalid") String email) {
}
