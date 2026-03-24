package kaleidoscope.j2ee.examlms.service;

import kaleidoscope.j2ee.examlms.dto.request.ProgressUpdateRequest;
import kaleidoscope.j2ee.examlms.dto.response.ProgressResponse;

public interface ProgressService {
    void updateProgress(ProgressUpdateRequest request);

    ProgressResponse getProgress(String userId, String courseId);
}
