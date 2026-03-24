package kaleidoscope.j2ee.examlms.dto.response;

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
public class ProgressResponse {

    private String courseId;
    private Double progressPercent;
    private long totalLessons;
    private long completedLessons;
}
