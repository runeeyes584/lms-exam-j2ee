package com.lms.repository;

import com.lms.entity.Chapter;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

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
