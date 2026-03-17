package com.lms.lms.service;

import com.lms.lms.dto.response.AuthResponse;

public interface AuthService {
    AuthResponse login(String email, String rawPassword);
}