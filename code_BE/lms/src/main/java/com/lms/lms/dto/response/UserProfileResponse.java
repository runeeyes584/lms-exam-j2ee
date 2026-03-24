package com.lms.lms.dto.response;

import com.lms.lms.entity.enums.Gender;
import com.lms.lms.entity.enums.Role;
import lombok.Builder;

@Builder
public record UserProfileResponse(
        String id,
        String email,
        String fullName,
        String avatarUrl,
        Role role,
        String phoneNumber,
        String dateOfBirth,
        String address,
        Gender gender,
        String schoolId) {
}