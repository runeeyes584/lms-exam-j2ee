package kaleidoscope.j2ee.examlms.service;

import kaleidoscope.j2ee.examlms.dto.request.ChangePasswordRequest;
import kaleidoscope.j2ee.examlms.dto.request.UpdateProfileRequest;
import kaleidoscope.j2ee.examlms.dto.response.UserProfileResponse;

public interface UserService {
    UserProfileResponse register(String email, String rawPassword, String fullName);

    UserProfileResponse getMyProfile(String userId);

    UserProfileResponse updateMyProfile(String userId, UpdateProfileRequest request);

    UserProfileResponse uploadAvatar(String userId, org.springframework.web.multipart.MultipartFile file);

    void changePassword(String userId, ChangePasswordRequest request);
}
