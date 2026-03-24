package kaleidoscope.j2ee.examlms.repository;

import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;

import kaleidoscope.j2ee.examlms.entity.LessonProgress;

public interface LessonProgressRepository extends MongoRepository<LessonProgress, String> {

    Optional<LessonProgress> findByUserIdAndLessonId(String userId, String lessonId);

    long countByUserIdAndCourseId(String userId, String courseId);

    long countByUserIdAndCourseIdAndCompletedTrue(String userId, String courseId);

}