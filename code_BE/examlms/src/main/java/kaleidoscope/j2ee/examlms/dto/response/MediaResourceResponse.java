package kaleidoscope.j2ee.examlms.dto.response;

import kaleidoscope.j2ee.examlms.entity.MediaResource.MediaType;
import lombok.Builder;
import lombok.Data;

/**
 * Response DTO returned to the client for a MediaResource object.
 */
@Data
@Builder
public class MediaResourceResponse {
    private String id;
    private String lessonId;
    private MediaType type;
    private String url;
    private String originalFileName;
    private String mimeType;
    /** Download link exposed to the frontend */
    private String downloadUrl;
}
