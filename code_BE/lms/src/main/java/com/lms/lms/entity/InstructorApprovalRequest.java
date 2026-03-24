package com.lms.lms.entity;

import com.lms.lms.entity.enums.InstructorRequestStatus;
import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Document(collection = "instructor_approval_requests")
public class InstructorApprovalRequest {

    @Id
    private String id;

    private String userId;

    private InstructorRequestStatus status;

    private String note;

    private Instant createdAt;

    private Instant reviewedAt;

    private String reviewedBy;
}