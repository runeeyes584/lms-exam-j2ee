package kaleidoscope.j2ee.examlms.dto.response;

import java.time.Instant;

import kaleidoscope.j2ee.examlms.entity.enums.InstructorRequestStatus;
import lombok.Builder;

@Builder
public record InstructorApprovalRequestResponse(
                String id,
                String userId,
                InstructorRequestUserResponse user,
                InstructorRequestStatus status,
                String note,
                String cvFileUrl,
                String cvOriginalFileName,
                Instant createdAt,
                Instant reviewedAt,
                String reviewedBy) {
}
