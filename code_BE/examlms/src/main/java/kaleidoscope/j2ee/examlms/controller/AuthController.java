package kaleidoscope.j2ee.examlms.controller;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;
import kaleidoscope.j2ee.examlms.dto.request.LoginRequest;
import kaleidoscope.j2ee.examlms.dto.request.LogoutRequest;
import kaleidoscope.j2ee.examlms.dto.request.RefreshTokenRequest;
import kaleidoscope.j2ee.examlms.dto.request.RegisterRequest;
import kaleidoscope.j2ee.examlms.dto.request.ResendRegistrationOtpRequest;
import kaleidoscope.j2ee.examlms.dto.request.VerifyRegistrationOtpRequest;
import kaleidoscope.j2ee.examlms.dto.response.ApiResponse;
import kaleidoscope.j2ee.examlms.dto.response.AuthResponse;
import kaleidoscope.j2ee.examlms.dto.response.RegistrationInitResponse;
import kaleidoscope.j2ee.examlms.dto.response.UserProfileResponse;
import kaleidoscope.j2ee.examlms.service.AuthService;
import kaleidoscope.j2ee.examlms.service.RegistrationOtpService;
import kaleidoscope.j2ee.examlms.utils.ApiResponseUtil;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
    private final RegistrationOtpService registrationOtpService;
    private final AuthService authService;

    @PostMapping("/register")
    public ApiResponse<RegistrationInitResponse> register(@Valid @RequestBody RegisterRequest req) {
        return ApiResponseUtil.success("OTP đã được gửi đến email của bạn",
                registrationOtpService.initiateRegistration(req));
    }

    @PostMapping("/register/verify-otp")
    public ApiResponse<UserProfileResponse> verifyRegisterOtp(@Valid @RequestBody VerifyRegistrationOtpRequest req) {
        return ApiResponseUtil.success("Đăng ký thành công",
                registrationOtpService.verifyOtp(req.email(), req.otp()));
    }

    @PostMapping("/register/resend-otp")
    public ApiResponse<RegistrationInitResponse> resendRegisterOtp(@Valid @RequestBody ResendRegistrationOtpRequest req) {
        return ApiResponseUtil.success("Đã gửi lại OTP",
                registrationOtpService.resendOtp(req.email()));
    }

    @PostMapping("/login")
    public ApiResponse<AuthResponse> login(@Valid @RequestBody LoginRequest req) {
        return ApiResponseUtil.success("Logged in", authService.login(req.email(), req.password()));
    }

    @PostMapping("/refresh")
    public ApiResponse<AuthResponse> refresh(@Valid @RequestBody RefreshTokenRequest req) {
        return ApiResponseUtil.success("Refreshed", authService.refresh(req.refreshToken()));
    }

    @PostMapping("/logout")
    public ApiResponse<Void> logout(@Valid @RequestBody LogoutRequest req) {
        authService.logout(req.refreshToken());
        return ApiResponseUtil.success("Logged out", null);
    }

}
