package kaleidoscope.j2ee.examlms.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import kaleidoscope.j2ee.examlms.dto.request.ManualGradeRequest;
import kaleidoscope.j2ee.examlms.dto.request.QuestionGradeRequest;
import kaleidoscope.j2ee.examlms.dto.response.ApiResponse;
import kaleidoscope.j2ee.examlms.dto.response.ExamAttemptResponse;
import kaleidoscope.j2ee.examlms.dto.response.GradingDetailResponse;
import kaleidoscope.j2ee.examlms.service.GradingService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/grading")
@RequiredArgsConstructor
@Tag(name = "Manual Grading", description = "APIs for instructors to manually grade exam attempts")
public class GradingController {
    
    private final GradingService gradingService;
    
    @GetMapping("/pending")
    @Operation(summary = "Get attempts needing grading",
               description = "Get all submitted attempts that need manual grading review")
    public ResponseEntity<ApiResponse<Page<ExamAttemptResponse>>> getAttemptsNeedingGrading(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        
        Pageable pageable = PageRequest.of(page, size, Sort.by("submittedAt").ascending());
        Page<ExamAttemptResponse> response = gradingService.getAttemptsNeedingGrading(pageable);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
    
    @GetMapping("/pending/exam/{examId}")
    @Operation(summary = "Get attempts needing grading for specific exam",
               description = "Get submitted attempts for a specific exam")
    public ResponseEntity<ApiResponse<Page<ExamAttemptResponse>>> getAttemptsNeedingGradingByExam(
            @PathVariable String examId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        
        Pageable pageable = PageRequest.of(page, size, Sort.by("submittedAt").ascending());
        Page<ExamAttemptResponse> response = gradingService.getAttemptsNeedingGradingByExam(examId, pageable);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
    
    @GetMapping("/details/{attemptId}")
    @Operation(summary = "Get grading details",
               description = "Get detailed grading information including all questions and answers")
    public ResponseEntity<ApiResponse<GradingDetailResponse>> getGradingDetails(
            @PathVariable String attemptId) {
        
        GradingDetailResponse response = gradingService.getGradingDetails(attemptId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
    
    @PostMapping("/question")
    @Operation(summary = "Grade a single question",
               description = "Manually grade or override score for a single question")
    public ResponseEntity<ApiResponse<GradingDetailResponse>> gradeQuestion(
            @RequestParam String attemptId,
            @Valid @RequestBody QuestionGradeRequest request,
            @RequestHeader(value = "X-User-Id", defaultValue = "instructor1") String userId) {
        
        GradingDetailResponse response = gradingService.gradeQuestion(attemptId, request, userId);
        return ResponseEntity.ok(ApiResponse.success("Question graded successfully", response));
    }
    
    @PostMapping("/attempt")
    @Operation(summary = "Grade multiple questions at once",
               description = "Grade multiple questions in a single request")
    public ResponseEntity<ApiResponse<ExamAttemptResponse>> gradeAttempt(
            @Valid @RequestBody ManualGradeRequest request,
            @RequestHeader(value = "X-User-Id", defaultValue = "instructor1") String userId) {
        
        ExamAttemptResponse response = gradingService.gradeAttempt(request, userId);
        return ResponseEntity.ok(ApiResponse.success("Attempt graded successfully", response));
    }
    
    @PostMapping("/finalize/{attemptId}")
    @Operation(summary = "Finalize grading",
               description = "Mark grading as complete and calculate final score")
    public ResponseEntity<ApiResponse<ExamAttemptResponse>> finalizeGrading(
            @PathVariable String attemptId,
            @RequestHeader(value = "X-User-Id", defaultValue = "instructor1") String userId) {
        
        ExamAttemptResponse response = gradingService.finalizeGrading(attemptId, userId);
        return ResponseEntity.ok(ApiResponse.success("Grading finalized successfully", response));
    }
}
