package com.lms.lms.controller;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.lms.lms.dto.request.LoginRequest;
import com.lms.lms.dto.request.RegisterRequest;
import com.lms.lms.dto.response.ApiResponse;
import com.lms.lms.dto.response.AuthResponse;
import com.lms.lms.entity.User;
import com.lms.lms.service.AuthService;
import com.lms.lms.service.UserService;
import com.lms.lms.utils.ApiResponseUtil;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
    private final UserService userService;
    private final AuthService authService;

    @PostMapping("/register")
    public ApiResponse<User> register(@Valid @RequestBody RegisterRequest req) {
        User user = userService.register(req.email(), req.password(), req.fullName());
        user.setPasswordHash(null);
        return ApiResponseUtil.success(user);
    }

    @PostMapping("/login")
    public ApiResponse<AuthResponse> login(@Valid @RequestBody LoginRequest req) {
        return ApiResponseUtil.success("Logged in", authService.login(req.email(), req.password()));
    }

}
