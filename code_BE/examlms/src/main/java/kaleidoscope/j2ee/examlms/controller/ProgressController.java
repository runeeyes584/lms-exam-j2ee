package kaleidoscope.j2ee.examlms.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;
import kaleidoscope.j2ee.examlms.dto.request.ProgressUpdateRequest;
import kaleidoscope.j2ee.examlms.dto.response.ApiResponse;
import kaleidoscope.j2ee.examlms.dto.response.ProgressResponse;
import kaleidoscope.j2ee.examlms.service.ProgressService;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/progress")
@RequiredArgsConstructor
public class ProgressController {

    private final ProgressService progressService;

    @PostMapping
    public ApiResponse<Void> updateProgress(@Valid @RequestBody ProgressUpdateRequest request) {

        progressService.updateProgress(request);

        return ApiResponse.<Void>builder()
                .code(1000)
                .message("Progress updated")
                .build();
    }

    @GetMapping("/{userId}/{courseId}")
    public ApiResponse<ProgressResponse> getProgress(
            @PathVariable String userId,
            @PathVariable String courseId) {
        ProgressResponse progress = progressService.getProgress(userId, courseId);

        return ApiResponse.<ProgressResponse>builder()
                .code(1000)
                .message("Success")
                .result(progress)
                .build();
    }
}