package kaleidoscope.j2ee.examlms.service.impl;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import kaleidoscope.j2ee.examlms.dto.request.CourseRequest;
import kaleidoscope.j2ee.examlms.dto.response.CourseResponse;
import kaleidoscope.j2ee.examlms.entity.Course;
import kaleidoscope.j2ee.examlms.exception.ResourceNotFoundException;
import kaleidoscope.j2ee.examlms.repository.CourseRepository;
import kaleidoscope.j2ee.examlms.service.CourseService;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CourseServiceImpl implements CourseService {

    private final CourseRepository courseRepository;

    @Override
    public List<CourseResponse> getAllCourses() {
        return courseRepository.findAllByIsDeletedFalse()
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<CourseResponse> getCoursesByInstructorId(String instructorId) {
        return courseRepository.findByInstructorIdAndIsDeletedFalse(instructorId)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public CourseResponse getCourseById(String id) {
        Course course = courseRepository.findByIdAndIsDeletedFalse(id)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found with id: " + id));
        return toResponse(course);
    }

    @Override
    public CourseResponse createCourse(CourseRequest request) {
        Course course = Course.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .price(request.getPrice())
                .coverImage(request.getCoverImage())
                .instructorId(request.getInstructorId())
                .isDeleted(false)
            .avgRating(0.0)
            .ratingCount(0)
                .build();
        Course saved = courseRepository.save(course);
        return toResponse(saved);
    }

    @Override
    public CourseResponse updateCourse(String id, CourseRequest request) {
        Course course = courseRepository.findByIdAndIsDeletedFalse(id)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found with id: " + id));
        course.setTitle(request.getTitle());
        course.setDescription(request.getDescription());
        course.setPrice(request.getPrice());
        course.setCoverImage(request.getCoverImage());
        course.setInstructorId(request.getInstructorId());
        Course updated = courseRepository.save(course);
        return toResponse(updated);
    }

    @Override
    public void deleteCourse(String id) {
        Course course = courseRepository.findByIdAndIsDeletedFalse(id)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found with id: " + id));
        // Soft-delete: only set flag, never physically remove from DB
        course.setDeleted(true);
        courseRepository.save(course);
    }

    // -------- Mapping helper -------- //

    private CourseResponse toResponse(Course course) {
        return CourseResponse.builder()
                .id(course.getId())
                .title(course.getTitle())
                .description(course.getDescription())
                .price(course.getPrice())
                .coverImage(course.getCoverImage())
                .instructorId(course.getInstructorId())
                .avgRating(course.getAvgRating())
                .ratingCount(course.getRatingCount())
                .isDeleted(course.isDeleted())
                .createdAt(course.getCreatedAt())
                .updatedAt(course.getUpdatedAt())
                .build();
    }
}
