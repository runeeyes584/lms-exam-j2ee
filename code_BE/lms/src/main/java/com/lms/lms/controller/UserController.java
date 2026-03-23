package com.lms.lms.controller;

import com.lms.lms.dto.request.ChangePasswordRequest;
import com.lms.lms.dto.request.UpdateProfileRequest;
import com.lms.lms.dto.response.ApiResponse;
import com.lms.lms.dto.response.UserProfileResponse;
import com.lms.lms.service.UserService;
import com.lms.lms.utils.ApiResponseUtil;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/me")
    public ApiResponse<UserProfileResponse> getMyProfile(Authentication authentication) {
        String userId = authentication.getName();
        return ApiResponseUtil.success(userService.getMyProfile(userId));
    }

    @PutMapping("/me")
    public ApiResponse<UserProfileResponse> updateMyProfile(
            Authentication authentication,
            @Valid @RequestBody UpdateProfileRequest request) {
        String userId = authentication.getName();
        return ApiResponseUtil.success(userService.updateMyProfile(userId, request));
    }

    @PostMapping("/me/change-password")
    public ApiResponse<Void> changePassword(
            Authentication authentication,
            @Valid @RequestBody ChangePasswordRequest request) {
        String userId = authentication.getName();
        userService.changePassword(userId, request);
        return ApiResponseUtil.success("Password changed successfully", null);
    }

    @PostMapping("/me/avatar")
    public ApiResponse<UserProfileResponse> uploadAvatar(
            Authentication authentication,
            @RequestParam("file") MultipartFile file) {
        String userId = authentication.getName();
        return ApiResponseUtil.success(userService.uploadAvatar(userId, file));
    }
}