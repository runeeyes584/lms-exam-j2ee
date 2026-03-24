package com.example.be_lms.repository;

import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.example.be_lms.entity.LessonProgress;

public interface LessonProgressRepository extends MongoRepository<LessonProgress, String> {

    Optional<LessonProgress> findByUserIdAndLessonId(String userId, String lessonId);

    long countByUserIdAndCourseId(String userId, String courseId);

    long countByUserIdAndCourseIdAndCompletedTrue(String userId, String courseId);

}