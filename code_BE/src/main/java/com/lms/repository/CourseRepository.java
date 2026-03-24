package com.lms.repository;

import com.lms.entity.Course;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * MongoDB repository for Course documents.
 */
@Repository
public interface CourseRepository extends MongoRepository<Course, String> {

    /** Returns all courses that have NOT been soft-deleted */
    List<Course> findAllByIsDeletedFalse();

    /** Find a course by ID only if not deleted */
    java.util.Optional<Course> findByIdAndIsDeletedFalse(String id);
}
