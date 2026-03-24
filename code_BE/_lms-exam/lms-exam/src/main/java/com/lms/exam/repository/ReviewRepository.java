package com.lms.exam.repository;

import com.lms.exam.model.Review;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface ReviewRepository extends MongoRepository<Review, String> {
    Page<Review> findByCourseIdAndIsDeletedFalse(String courseId, Pageable pageable);
    Optional<Review> findByCourseIdAndUserIdAndIsDeletedFalse(String courseId, String userId);
    long countByCourseIdAndIsDeletedFalse(String courseId);
}
