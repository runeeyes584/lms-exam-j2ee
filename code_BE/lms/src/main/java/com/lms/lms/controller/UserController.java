package com.lms.lms.controller;

import com.lms.lms.dto.response.ApiResponse;
import com.lms.lms.utils.ApiResponseUtil;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @GetMapping("/me")
    public ApiResponse<String> me(Authentication authentication) {
        String userId = authentication.getName();
        return ApiResponseUtil.success("Current user id: " + userId);
    }
}