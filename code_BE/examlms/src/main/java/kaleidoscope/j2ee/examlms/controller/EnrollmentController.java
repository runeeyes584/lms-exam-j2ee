package kaleidoscope.j2ee.examlms.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import kaleidoscope.j2ee.examlms.dto.request.EnrollmentRequest;
import kaleidoscope.j2ee.examlms.dto.response.ApiResponse;
import kaleidoscope.j2ee.examlms.dto.response.EnrollmentResponse;
import kaleidoscope.j2ee.examlms.service.EnrollmentService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/enrollments")
@RequiredArgsConstructor
public class EnrollmentController {

    private final EnrollmentService enrollmentService;

    @PostMapping
    public ApiResponse<Void> enroll(@Valid @RequestBody EnrollmentRequest request) {

        enrollmentService.enroll(
                request.getUserId(),
                request.getCourseId());

        return ApiResponse.<Void>builder()
                .code(1000)
                .message("Enroll success")
                .build();
    }

    @GetMapping("/{userId}")
    public ApiResponse<List<EnrollmentResponse>> getMyCourses(@PathVariable String userId) {

        List<EnrollmentResponse> courses = enrollmentService.getMyCourses(userId);

        return ApiResponse.<List<EnrollmentResponse>>builder()
                .code(1000)
                .message("Success")
                .result(courses)
                .build();
    }
}