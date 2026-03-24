package com.lms.repository;

import com.lms.entity.Lesson;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

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
