package com.example.be_lms.service;

import java.util.List;

import com.example.be_lms.dto.response.EnrollmentResponse;

public interface EnrollmentService {
    void enroll(String userId, String courseId);

    List<EnrollmentResponse> getMyCourses(String userId);
}
