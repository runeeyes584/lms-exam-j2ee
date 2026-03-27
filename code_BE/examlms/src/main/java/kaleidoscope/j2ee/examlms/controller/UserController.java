package kaleidoscope.j2ee.examlms.controller;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import jakarta.validation.Valid;
import kaleidoscope.j2ee.examlms.dto.request.ChangePasswordRequest;
import kaleidoscope.j2ee.examlms.dto.request.UpdateProfileRequest;
import kaleidoscope.j2ee.examlms.dto.response.ApiResponse;
import kaleidoscope.j2ee.examlms.dto.response.UserProfileResponse;
import kaleidoscope.j2ee.examlms.service.UserService;
import kaleidoscope.j2ee.examlms.utils.ApiResponseUtil;
import lombok.RequiredArgsConstructor;

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