package com.lms.lms.service.impl;

import java.time.Instant;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.lms.lms.entity.User;
import com.lms.lms.entity.enums.Role;
import com.lms.lms.exception.AppException;
import com.lms.lms.repository.UserRepository;
import com.lms.lms.service.UserService;
import com.lms.lms.utils.ResponseCode;

import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@Service
public class UserServiceImpl implements UserService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public User register(String email, String rawPassword, String fullName) {
        if (userRepository.existsByEmail(email)) {
            throw new AppException(ResponseCode.VALIDATION_ERROR, "Email already by exits");
        }
        Instant now = Instant.now();

        User user = User.builder()
                .email(email)
                .passwordHash(passwordEncoder.encode(rawPassword))
                .fullName(fullName)
                .role(Role.STUDENT)
                .createdAt(now)
                .updatedAt(now)
                .build();
        return userRepository.save(user);

    }

}
