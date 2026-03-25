package kaleidoscope.j2ee.examlms.dto.response;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CourseMemberResponse {
    private String userId;
    private String fullName;
    private String email;
    private LocalDateTime enrolledAt;
    private Double progressPercent;
}

