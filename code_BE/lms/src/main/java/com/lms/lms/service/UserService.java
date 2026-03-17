package com.lms.lms.service;

import com.lms.lms.entity.User;

public interface UserService {
    User register(String email, String rawPassword, String fullName);
}
