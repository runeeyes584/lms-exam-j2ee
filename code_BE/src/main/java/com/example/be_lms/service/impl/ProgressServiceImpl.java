package com.example.be_lms.service.impl;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.be_lms.dto.request.ProgressUpdateRequest;
import com.example.be_lms.dto.response.ProgressResponse;
import com.example.be_lms.entity.LessonProgress;
import com.example.be_lms.entity.UserCourse;
import com.example.be_lms.exception.ProgressException;
import com.example.be_lms.repository.LessonProgressRepository;
import com.example.be_lms.repository.UserCourseRepository;
import com.example.be_lms.service.ProgressService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ProgressServiceImpl implements ProgressService {

        private final LessonProgressRepository progressRepository;
        private final UserCourseRepository userCourseRepository;

        @Override
        @Transactional
        public void updateProgress(ProgressUpdateRequest request) {

                LessonProgress progress = progressRepository
                                .findByUserIdAndLessonId(request.getUserId(), request.getLessonId())
                                .orElse(new LessonProgress());

                progress.setUserId(request.getUserId());
                progress.setCourseId(request.getCourseId());
                progress.setLessonId(request.getLessonId());
                progress.setCompleted(request.isCompleted());
                progress.setLastWatchedSecond(request.getLastWatchedSecond());

                progressRepository.save(progress);

                // Calculate actual progress percentage
                long totalLessons = progressRepository
                                .countByUserIdAndCourseId(request.getUserId(), request.getCourseId());
                long completedLessons = progressRepository
                                .countByUserIdAndCourseIdAndCompletedTrue(request.getUserId(), request.getCourseId());

                double percent = totalLessons > 0
                                ? (double) completedLessons / totalLessons * 100
                                : 0.0;

                UserCourse userCourse = userCourseRepository
                                .findByUserIdAndCourseId(request.getUserId(), request.getCourseId())
                                .orElseThrow(() -> new ProgressException("Enrollment not found"));

                userCourse.setProgressPercent(percent);

                userCourseRepository.save(userCourse);
        }

        @Override
        public ProgressResponse getProgress(String userId, String courseId) {

                UserCourse userCourse = userCourseRepository
                                .findByUserIdAndCourseId(userId, courseId)
                                .orElseThrow(() -> new RuntimeException("Enrollment not found"));

                long totalLessons = progressRepository.countByUserIdAndCourseId(userId, courseId);
                long completedLessons = progressRepository.countByUserIdAndCourseIdAndCompletedTrue(userId, courseId);

                return ProgressResponse.builder()
                                .courseId(courseId)
                                .progressPercent(userCourse.getProgressPercent())
                                .totalLessons(totalLessons)
                                .completedLessons(completedLessons)
                                .build();
        }
}