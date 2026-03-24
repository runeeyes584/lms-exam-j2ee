package kaleidoscope.j2ee.examlms.service;

import java.util.List;

import kaleidoscope.j2ee.examlms.dto.response.EnrollmentResponse;

public interface EnrollmentService {
    void enroll(String userId, String courseId);

    List<EnrollmentResponse> getMyCourses(String userId);
}
