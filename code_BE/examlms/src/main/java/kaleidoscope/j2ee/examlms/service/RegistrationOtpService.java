package kaleidoscope.j2ee.examlms.service;

import kaleidoscope.j2ee.examlms.dto.request.RegisterRequest;
import kaleidoscope.j2ee.examlms.dto.response.RegistrationInitResponse;
import kaleidoscope.j2ee.examlms.dto.response.UserProfileResponse;

public interface RegistrationOtpService {
    RegistrationInitResponse initiateRegistration(RegisterRequest request);

    UserProfileResponse verifyOtp(String email, String otp);

    RegistrationInitResponse resendOtp(String email);
}
