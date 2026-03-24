package com.example.be_lms.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.example.be_lms.entity.UserCourse;

public interface UserCourseRepository extends MongoRepository<UserCourse, String> {

    Optional<UserCourse> findByUserIdAndCourseId(String userId, String courseId);

    List<UserCourse> findByUserId(String userId);

}