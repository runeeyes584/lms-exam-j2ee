package kaleidoscope.j2ee.examlms.repository;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import kaleidoscope.j2ee.examlms.entity.Course;

/**
 * MongoDB repository for Course documents.
 */
@Repository
public interface CourseRepository extends MongoRepository<Course, String> {

    /** Returns all courses that have NOT been soft-deleted */
    List<Course> findAllByIsDeletedFalse();

    /** Returns active courses owned by instructor */
    List<Course> findByInstructorIdAndIsDeletedFalse(String instructorId);

    /** Find a course by ID only if not deleted */
    java.util.Optional<Course> findByIdAndIsDeletedFalse(String id);
}
