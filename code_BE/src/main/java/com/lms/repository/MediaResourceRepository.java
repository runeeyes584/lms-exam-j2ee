package com.lms.repository;

import com.lms.entity.MediaResource;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

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
