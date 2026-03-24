package kaleidoscope.j2ee.examlms.service.impl;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import kaleidoscope.j2ee.examlms.dto.response.EnrollmentResponse;
import kaleidoscope.j2ee.examlms.entity.UserCourse;
import kaleidoscope.j2ee.examlms.exception.EnrollmentException;
import kaleidoscope.j2ee.examlms.repository.UserCourseRepository;
import kaleidoscope.j2ee.examlms.service.EnrollmentService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class EnrollmentServiceImpl implements EnrollmentService {

    private final UserCourseRepository repository;

    @Override
    @Transactional
    public void enroll(String userId, String courseId) {

        repository.findByUserIdAndCourseId(userId, courseId)
                .ifPresent(x -> {
                    throw new EnrollmentException("User already enrolled");
                });

        UserCourse userCourse = UserCourse.builder()
                .userId(userId)
                .courseId(courseId)
                .enrolledAt(LocalDateTime.now())
                .progressPercent(0.0)
                .build();

        repository.save(userCourse);
    }

    @Override
    public List<EnrollmentResponse> getMyCourses(String userId) {

        List<UserCourse> userCourses = repository.findByUserId(userId);

        return userCourses.stream()
                .map(uc -> EnrollmentResponse.builder()
                        .courseId(uc.getCourseId())
                        .enrolledAt(uc.getEnrolledAt())
                        .progressPercent(uc.getProgressPercent())
                        .build())
                .toList();
    }

    @Override
    public boolean hasUserPurchasedCourse(String userId, String courseId) {
        return repository.findByUserIdAndCourseId(userId, courseId).isPresent();
    }
}