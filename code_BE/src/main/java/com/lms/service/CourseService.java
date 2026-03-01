package com.lms.service;

import com.lms.dto.request.CourseRequest;
import com.lms.dto.response.CourseResponse;

import java.util.List;

/**
 * Business logic interface for Course management.
 */
public interface CourseService {

    /** Returns all active (non-deleted) courses */
    List<CourseResponse> getAllCourses();

    /** Returns a single active course by its ID */
    CourseResponse getCourseById(String id);

    /** Creates a new course and returns the saved entity as a response */
    CourseResponse createCourse(CourseRequest request);

    /** Updates an existing course by ID */
    CourseResponse updateCourse(String id, CourseRequest request);

    /** Soft-deletes a course by setting isDeleted = true */
    void deleteCourse(String id);
}
