package com.lms.service.impl;

import com.lms.dto.request.CourseRequest;
import com.lms.dto.response.CourseResponse;
import com.lms.entity.Course;
import com.lms.exception.ResourceNotFoundException;
import com.lms.repository.CourseRepository;
import com.lms.service.CourseService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

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
                .isDeleted(course.isDeleted())
                .createdAt(course.getCreatedAt())
                .updatedAt(course.getUpdatedAt())
                .build();
    }
}
