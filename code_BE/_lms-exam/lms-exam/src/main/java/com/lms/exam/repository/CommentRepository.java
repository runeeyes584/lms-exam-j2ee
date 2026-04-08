package com.lms.exam.repository;

import com.lms.exam.model.Comment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface CommentRepository extends MongoRepository<Comment, String> {

    // Top-level comments for a course (parentId is null)
    Page<Comment> findByCourseIdAndParentIdIsNullAndIsDeletedFalse(String courseId, Pageable pageable);

    // Top-level comments for a specific lesson
    Page<Comment> findByCourseIdAndLessonIdAndParentIdIsNullAndIsDeletedFalse(String courseId, String lessonId, Pageable pageable);

    // Replies to a comment
    List<Comment> findByParentIdAndIsDeletedFalseOrderByCreatedAtAsc(String parentId);

    // Count replies
    long countByParentIdAndIsDeletedFalse(String parentId);

    // User's comments
    Page<Comment> findByUserIdAndIsDeletedFalse(String userId, Pageable pageable);
}
