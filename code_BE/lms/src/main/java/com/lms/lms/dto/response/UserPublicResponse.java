package com.lms.lms.dto.response;

import com.lms.lms.entity.enums.Role;
import lombok.Builder;

@Builder
public record UserPublicResponse(
        String id,
        String email,
        String fullName,
        String avatarUrl,
        Role role) {
}