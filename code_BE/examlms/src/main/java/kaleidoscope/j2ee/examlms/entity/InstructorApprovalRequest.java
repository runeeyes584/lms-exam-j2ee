package kaleidoscope.j2ee.examlms.entity;

import java.time.Instant;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import kaleidoscope.j2ee.examlms.entity.enums.InstructorRequestStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

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

    private String cvFileUrl;

    private String cvOriginalFileName;

    private Instant createdAt;

    private Instant reviewedAt;

    private String reviewedBy;
}
