package kaleidoscope.j2ee.examlms.dto.response;

import java.time.LocalDateTime;

import lombok.Builder;

@Builder
public record CertificateResponse(
        String id,
        String courseId,
        String courseName,
        String studentName,
        LocalDateTime issuedAt,
        String certificateNumber) {
}
