package kaleidoscope.j2ee.examlms.repository;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import kaleidoscope.j2ee.examlms.entity.Lesson;

/**
 * MongoDB repository for Lesson documents.
 */
@Repository
public interface LessonRepository extends MongoRepository<Lesson, String> {

    /**
     * Returns all active lessons for a given chapter, ordered by orderIndex
     * ascending
     */
    List<Lesson> findByChapterIdAndIsDeletedFalseOrderByOrderIndexAsc(String chapterId);
}
