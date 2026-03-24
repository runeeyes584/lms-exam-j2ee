package kaleidoscope.j2ee.examlms.dto.response;

import lombok.Builder;
import lombok.Data;

/**
 * Response DTO returned to the client for a Lesson object.
 */
@Data
@Builder
public class LessonResponse {
    private String id;
    private String chapterId;
    private String title;
    private String content;
    private int orderIndex;
    private boolean isDeleted;
}
