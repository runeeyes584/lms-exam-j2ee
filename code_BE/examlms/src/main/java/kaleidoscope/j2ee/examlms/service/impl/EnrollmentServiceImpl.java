package kaleidoscope.j2ee.examlms.service.impl;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import kaleidoscope.j2ee.examlms.dto.response.CourseMemberResponse;
import kaleidoscope.j2ee.examlms.dto.response.EnrollmentResponse;
import kaleidoscope.j2ee.examlms.entity.Course;
import kaleidoscope.j2ee.examlms.entity.UserCourse;
import kaleidoscope.j2ee.examlms.entity.User;
import kaleidoscope.j2ee.examlms.exception.EnrollmentException;
import kaleidoscope.j2ee.examlms.repository.CourseRepository;
import kaleidoscope.j2ee.examlms.repository.UserCourseRepository;
import kaleidoscope.j2ee.examlms.repository.UserRepository;
import kaleidoscope.j2ee.examlms.service.EnrollmentService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class EnrollmentServiceImpl implements EnrollmentService {

    private final UserCourseRepository repository;
    private final CourseRepository courseRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional
    public void enroll(String userId, String courseId) {
        courseRepository.findByIdAndIsDeletedFalse(courseId)
                .orElseThrow(() -> new EnrollmentException("Course not found"));

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

    @Override
    public List<CourseMemberResponse> getCourseMembers(String instructorId, String courseId) {
        Course course = courseRepository.findByIdAndIsDeletedFalse(courseId)
                .orElseThrow(() -> new EnrollmentException("Course not found"));

        if (instructorId != null && !instructorId.isBlank()) {
            if (course.getInstructorId() == null || !course.getInstructorId().equals(instructorId)) {
                throw new EnrollmentException("You do not have permission to view members of this course");
            }
        }

        List<UserCourse> enrollments = repository.findByCourseId(courseId);
        return enrollments.stream()
                .map(enrollment -> {
                    Optional<User> userOptional = userRepository.findById(enrollment.getUserId());
                    User user = userOptional.orElse(null);
                    return CourseMemberResponse.builder()
                            .userId(enrollment.getUserId())
                            .fullName(user != null ? user.getFullName() : null)
                            .email(user != null ? user.getEmail() : null)
                            .enrolledAt(enrollment.getEnrolledAt())
                            .progressPercent(enrollment.getProgressPercent())
                            .build();
                })
                .toList();
    }
}
