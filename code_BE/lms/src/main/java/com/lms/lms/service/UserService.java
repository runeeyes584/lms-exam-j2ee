package com.lms.lms.service;

import com.lms.lms.dto.request.ChangePasswordRequest;
import com.lms.lms.dto.request.UpdateProfileRequest;
import com.lms.lms.dto.response.UserProfileResponse;
import com.lms.lms.entity.User;

public interface UserService {
    User register(String email, String rawPassword, String fullName);

    UserProfileResponse getMyProfile(String userId);

    UserProfileResponse updateMyProfile(String userId, UpdateProfileRequest request);

    UserProfileResponse uploadAvatar(String userId, org.springframework.web.multipart.MultipartFile file);

    void changePassword(String userId, ChangePasswordRequest request);
}
