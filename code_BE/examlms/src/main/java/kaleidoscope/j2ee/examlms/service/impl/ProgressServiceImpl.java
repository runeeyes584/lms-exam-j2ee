package kaleidoscope.j2ee.examlms.service.impl;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import kaleidoscope.j2ee.examlms.dto.request.ProgressUpdateRequest;
import kaleidoscope.j2ee.examlms.dto.response.ProgressResponse;
import kaleidoscope.j2ee.examlms.entity.Chapter;
import kaleidoscope.j2ee.examlms.entity.LessonProgress;
import kaleidoscope.j2ee.examlms.entity.UserCourse;
import kaleidoscope.j2ee.examlms.exception.ProgressException;
import kaleidoscope.j2ee.examlms.repository.ChapterRepository;
import kaleidoscope.j2ee.examlms.repository.LessonRepository;
import kaleidoscope.j2ee.examlms.repository.LessonProgressRepository;
import kaleidoscope.j2ee.examlms.repository.UserCourseRepository;
import kaleidoscope.j2ee.examlms.service.CertificateService;
import kaleidoscope.j2ee.examlms.service.ProgressService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ProgressServiceImpl implements ProgressService {
        private static final Logger log = LoggerFactory.getLogger(ProgressServiceImpl.class);

        private final LessonProgressRepository progressRepository;
        private final UserCourseRepository userCourseRepository;
        private final ChapterRepository chapterRepository;
        private final LessonRepository lessonRepository;
        private final CertificateService certificateService;

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

                // Calculate progress percentage based on all lessons in course
                long totalLessons = getTotalLessonsInCourse(request.getCourseId());
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

                // Auto issue certificate right after learner completes 100% course progress
                if (percent >= 100.0) {
                        try {
                                certificateService.autoIssueCertificateIfCompleted(request.getUserId(), request.getCourseId());
                        } catch (Exception ex) {
                                log.warn("Auto certificate issuance failed for user={} course={}: {}",
                                                request.getUserId(), request.getCourseId(), ex.getMessage());
                        }
                }
        }

        @Override
        public ProgressResponse getProgress(String userId, String courseId) {

                UserCourse userCourse = userCourseRepository
                                .findByUserIdAndCourseId(userId, courseId)
                                .orElseThrow(() -> new RuntimeException("Enrollment not found"));

                long totalLessons = getTotalLessonsInCourse(courseId);
                long completedLessons = progressRepository.countByUserIdAndCourseIdAndCompletedTrue(userId, courseId);
                List<String> completedLessonIds = progressRepository
                                .findByUserIdAndCourseIdAndCompletedTrue(userId, courseId)
                                .stream()
                                .map(LessonProgress::getLessonId)
                                .toList();

                return ProgressResponse.builder()
                                .userId(userId)
                                .courseId(courseId)
                                .progressPercent(userCourse.getProgressPercent())
                                .totalLessons(totalLessons)
                                .completedLessons(completedLessons)
                                .completedLessonIds(completedLessonIds)
                                .build();
        }

        private long getTotalLessonsInCourse(String courseId) {
                List<Chapter> chapters = chapterRepository.findByCourseIdAndIsDeletedFalseOrderByOrderIndexAsc(courseId);
                long totalLessons = 0;
                for (Chapter chapter : chapters) {
                        totalLessons += lessonRepository.findByChapterIdAndIsDeletedFalseOrderByOrderIndexAsc(chapter.getId()).size();
                }
                return totalLessons;
        }
}
