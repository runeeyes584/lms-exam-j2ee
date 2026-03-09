package com.example.be_lms.service;

import com.example.be_lms.dto.request.ProgressUpdateRequest;
import com.example.be_lms.dto.response.ProgressResponse;

public interface ProgressService {
    void updateProgress(ProgressUpdateRequest request);

    ProgressResponse getProgress(String userId, String courseId);
}
