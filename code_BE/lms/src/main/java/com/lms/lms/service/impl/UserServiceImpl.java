package com.lms.lms.service.impl;

import java.nio.file.Files;
import java.nio.file.Paths;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.time.Instant;
import java.util.UUID;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.lms.lms.dto.request.ChangePasswordRequest;
import com.lms.lms.dto.request.UpdateProfileRequest;
import com.lms.lms.dto.response.UserProfileResponse;
import com.lms.lms.entity.User;
import com.lms.lms.entity.enums.Role;
import com.lms.lms.exception.AppException;
import com.lms.lms.repository.UserRepository;
import com.lms.lms.service.UserService;
import com.lms.lms.utils.ResponseCode;
import org.springframework.beans.factory.annotation.Value;

import java.io.IOException;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@Service

public class UserServiceImpl implements UserService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public UserProfileResponse register(String email, String rawPassword, String fullName) {
        if (userRepository.existsByEmail(email)) {
            throw new AppException(ResponseCode.VALIDATION_ERROR, "Email already exits");
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
        User saved = userRepository.save(user);

        return toProfileResponse(saved);
    }

    @Override
    public UserProfileResponse getMyProfile(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ResponseCode.NOT_FOUND, "User not found"));

        return toProfileResponse(user);
    }

    @Override
    public UserProfileResponse updateMyProfile(String userId, UpdateProfileRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ResponseCode.NOT_FOUND, "User not found"));

        user.setFullName(request.fullName());
        user.setPhoneNumber(request.phoneNumber());
        user.setDateOfBirth(request.dateOfBirth());
        user.setAddress(request.address());
        user.setGender(request.gender());
        user.setSchoolId(request.schoolId());
        user.setUpdatedAt(Instant.now());

        User savedUser = userRepository.save(user);

        return toProfileResponse(savedUser);
    }

    @Override
    public void changePassword(String userId, ChangePasswordRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ResponseCode.NOT_FOUND, "User not found"));

        if (!passwordEncoder.matches(request.oldPassword(), user.getPasswordHash())) {
            throw new AppException(ResponseCode.UNAUTHORIZED, "Old password is incorrect");
        }

        if (request.oldPassword().equals(request.newPassword())) {
            throw new AppException(ResponseCode.VALIDATION_ERROR, "New password must be different from old password");
        }

        user.setPasswordHash(passwordEncoder.encode(request.newPassword()));
        user.setUpdatedAt(Instant.now());

        userRepository.save(user);
    }

    @Value("${upload.dir}")
    private String uploadDir;

    @Override
    public UserProfileResponse uploadAvatar(String userId, MultipartFile file) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ResponseCode.NOT_FOUND, "User not found"));

        if (file == null || file.isEmpty()) {
            throw new AppException(ResponseCode.VALIDATION_ERROR, "Avatar file is required");
        }

        String contentType = file.getContentType();
        if (contentType == null ||
                (!contentType.equals("image/jpeg")
                        && !contentType.equals("image/png")
                        && !contentType.equals("image/webp"))) {
            throw new AppException(ResponseCode.VALIDATION_ERROR, "Only JPG, PNG, WEBP files are allowed");
        }

        try {
            Path avatarDir = Paths.get(uploadDir, "avatars").toAbsolutePath().normalize();
            Files.createDirectories(avatarDir);

            String originalFilename = file.getOriginalFilename();
            String extension = getFileExtension(originalFilename);

            String newFileName = UUID.randomUUID() + (extension.isBlank() ? "" : "." + extension);
            Path targetPath = avatarDir.resolve(newFileName);

            Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);

            String avatarUrl = "/uploads/avatars/" + newFileName;

            // xóa avatar cũ nếu có
            if (user.getAvatarUrl() != null && user.getAvatarUrl().startsWith("/uploads/avatars/")) {
                String oldFileName = user.getAvatarUrl().substring("/uploads/avatars/".length());
                Path oldFile = avatarDir.resolve(oldFileName);
                Files.deleteIfExists(oldFile);
            }

            user.setAvatarUrl(avatarUrl);
            user.setUpdatedAt(Instant.now());

            User savedUser = userRepository.save(user);

            return toProfileResponse(savedUser);

        } catch (IOException ex) {
            throw new AppException(ResponseCode.ERROR, "Failed to upload avatar");
        }
    }

    private String getFileExtension(String fileName) {
        if (fileName == null || !fileName.contains(".")) {
            return "";
        }
        return fileName.substring(fileName.lastIndexOf('.') + 1).toLowerCase();
    }

    private UserProfileResponse toProfileResponse(User user) {
        return UserProfileResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .avatarUrl(user.getAvatarUrl())
                .role(user.getRole())
                .phoneNumber(user.getPhoneNumber())
                .dateOfBirth(user.getDateOfBirth())
                .address(user.getAddress())
                .gender(user.getGender())
                .schoolId(user.getSchoolId())
                .build();
    }

}
