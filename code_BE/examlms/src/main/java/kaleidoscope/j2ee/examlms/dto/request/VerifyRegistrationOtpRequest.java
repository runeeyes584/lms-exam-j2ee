package kaleidoscope.j2ee.examlms.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record VerifyRegistrationOtpRequest(
        @NotBlank(message = "Email required") @Email(message = "Email invalid") String email,
        @NotBlank(message = "OTP is required") @Pattern(regexp = "^\\d{6}$", message = "OTP must contain 6 digits") String otp) {
}
