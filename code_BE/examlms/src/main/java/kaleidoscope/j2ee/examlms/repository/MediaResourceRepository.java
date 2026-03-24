package kaleidoscope.j2ee.examlms.repository;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import kaleidoscope.j2ee.examlms.entity.MediaResource;

/**
 * MongoDB repository for MediaResource documents.
 */
@Repository
public interface MediaResourceRepository extends MongoRepository<MediaResource, String> {

    /** Returns all media resources attached to a given lesson */
    List<MediaResource> findByLessonId(String lessonId);

    /** Delete all resources for a lesson (used when lesson is deleted) */
    void deleteByLessonId(String lessonId);
}
