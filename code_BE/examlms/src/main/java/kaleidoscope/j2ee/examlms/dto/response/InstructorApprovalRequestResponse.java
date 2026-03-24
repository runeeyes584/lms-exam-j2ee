package kaleidoscope.j2ee.examlms.dto.response;

import java.time.Instant;

import kaleidoscope.j2ee.examlms.entity.enums.InstructorRequestStatus;
import lombok.Builder;

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