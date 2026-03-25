package kaleidoscope.j2ee.examlms.service;

import java.util.List;

import kaleidoscope.j2ee.examlms.dto.request.CourseRequest;
import kaleidoscope.j2ee.examlms.dto.response.CourseResponse;

/**
 * Business logic interface for Course management.
 */
public interface CourseService {

    /** Returns all active (non-deleted) courses */
    List<CourseResponse> getAllCourses();

    /** Returns all active courses owned by an instructor */
    List<CourseResponse> getCoursesByInstructorId(String instructorId);

    /** Returns a single active course by its ID */
    CourseResponse getCourseById(String id);

    /** Creates a new course and returns the saved entity as a response */
    CourseResponse createCourse(CourseRequest request);

    /** Updates an existing course by ID */
    CourseResponse updateCourse(String id, CourseRequest request);

    /** Soft-deletes a course by setting isDeleted = true */
    void deleteCourse(String id);
}
