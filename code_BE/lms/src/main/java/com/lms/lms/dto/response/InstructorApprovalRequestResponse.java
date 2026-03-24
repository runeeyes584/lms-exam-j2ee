package com.lms.lms.dto.response;

import com.lms.lms.entity.enums.InstructorRequestStatus;
import lombok.Builder;

import java.time.Instant;

@Builder
public record InstructorApprovalRequestResponse(
        String id,
        String userId,
        InstructorRequestStatus status,
        String note,
        Instant createdAt,
        Instant reviewedAt,
        String reviewedBy) {
}