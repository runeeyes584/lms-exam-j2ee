package kaleidoscope.j2ee.examlms.service;

import kaleidoscope.j2ee.examlms.dto.response.AuthResponse;

public interface AuthService {
    AuthResponse login(String email, String rawPassword);

    AuthResponse refresh(String refreshToken);

    void logout(String refreshToken);
}