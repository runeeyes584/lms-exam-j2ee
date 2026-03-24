package kaleidoscope.j2ee.examlms.repository;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import kaleidoscope.j2ee.examlms.entity.Chapter;

/**
 * MongoDB repository for Chapter documents.
 */
@Repository
public interface ChapterRepository extends MongoRepository<Chapter, String> {

    /**
     * Returns all active chapters for a given course, ordered by orderIndex
     * ascending
     */
    List<Chapter> findByCourseIdAndIsDeletedFalseOrderByOrderIndexAsc(String courseId);
}
