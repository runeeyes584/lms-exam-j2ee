package kaleidoscope.j2ee.examlms.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;
import kaleidoscope.j2ee.examlms.dto.request.CourseRequest;
import kaleidoscope.j2ee.examlms.dto.response.ApiResponse;
import kaleidoscope.j2ee.examlms.dto.response.CourseResponse;
import kaleidoscope.j2ee.examlms.service.CourseService;
import lombok.RequiredArgsConstructor;

/**
 * REST controller for Course CRUD operations.
 * Base path: /api/v1/courses
 */
@RestController
@RequestMapping("/api/v1/courses")
@RequiredArgsConstructor
public class CourseController {

    private final CourseService courseService;

    /** GET /api/v1/courses — List all active courses */
    @GetMapping
    public ResponseEntity<ApiResponse<List<CourseResponse>>> getAllCourses() {
        return ResponseEntity.ok(ApiResponse.success(courseService.getAllCourses()));
    }

    /** GET /api/v1/courses/{id} — Get a single course */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<CourseResponse>> getCourse(@PathVariable String id) {
        return ResponseEntity.ok(ApiResponse.success(courseService.getCourseById(id)));
    }

    /** POST /api/v1/courses — Create a course */
    @PostMapping
    public ResponseEntity<ApiResponse<CourseResponse>> createCourse(@Valid @RequestBody CourseRequest request) {
        CourseResponse created = courseService.createCourse(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Course created successfully", created));
    }

    /** PUT /api/v1/courses/{id} — Update a course */
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<CourseResponse>> updateCourse(
            @PathVariable String id,
            @Valid @RequestBody CourseRequest request) {
        return ResponseEntity
                .ok(ApiResponse.success("Course updated successfully", courseService.updateCourse(id, request)));
    }

    /** DELETE /api/v1/courses/{id} — Soft-delete a course */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteCourse(@PathVariable String id) {
        courseService.deleteCourse(id);
        return ResponseEntity.ok(ApiResponse.success("Course deleted (soft)", null));
    }
}
