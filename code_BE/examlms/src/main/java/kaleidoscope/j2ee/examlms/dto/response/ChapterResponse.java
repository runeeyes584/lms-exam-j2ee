package kaleidoscope.j2ee.examlms.dto.response;

import lombok.Builder;
import lombok.Data;

/**
 * Response DTO returned to the client for a Chapter object.
 */
@Data
@Builder
public class ChapterResponse {
    private String id;
    private String courseId;
    private String title;
    private int orderIndex;
    private boolean isDeleted;
}
