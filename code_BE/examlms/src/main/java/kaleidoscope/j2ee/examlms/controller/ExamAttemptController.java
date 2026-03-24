package kaleidoscope.j2ee.examlms.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import kaleidoscope.j2ee.examlms.dto.request.ExamSubmitRequest;
import kaleidoscope.j2ee.examlms.dto.response.ApiResponse;
import kaleidoscope.j2ee.examlms.dto.response.ExamAttemptResponse;
import kaleidoscope.j2ee.examlms.entity.StudentAnswer;
import kaleidoscope.j2ee.examlms.service.ExamAttemptService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@Tag(name = "Exam Attempts", description = "APIs for taking exams and viewing results")
public class ExamAttemptController {
    
    private final ExamAttemptService attemptService;
    
    @PostMapping("/exams/{examId}/start")
    @Operation(summary = "Start exam",
               description = "Begin a new exam attempt. Timer starts immediately.")
    public ResponseEntity<ApiResponse<ExamAttemptResponse>> startExam(
            @PathVariable String examId,
            @RequestHeader(value = "X-User-Id", defaultValue = "student1") String userId) {
        
        ExamAttemptResponse response = attemptService.startExam(examId, userId);
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.success("Exam started successfully. Timer is running!", response));
    }
    
    @PutMapping("/attempts/{attemptId}/progress")
    @Operation(summary = "Save progress",
               description = "Auto-save answers while taking exam. Call this periodically.")
    public ResponseEntity<ApiResponse<ExamAttemptResponse>> saveProgress(
            @PathVariable String attemptId,
            @RequestBody List<StudentAnswer> answers) {
        
        ExamAttemptResponse response = attemptService.saveProgress(attemptId, answers);
        return ResponseEntity.ok(ApiResponse.success("Progress saved", response));
    }
    
    @PostMapping("/attempts/{attemptId}/submit")
    @Operation(summary = "Submit exam",
               description = "Submit exam for grading. Auto-grades immediately for MC/TF/Fill-in questions.")
    public ResponseEntity<ApiResponse<ExamAttemptResponse>> submitExam(
            @PathVariable String attemptId,
            @Valid @RequestBody ExamSubmitRequest request) {
        
        ExamAttemptResponse response = attemptService.submitExam(attemptId, request);
        return ResponseEntity.ok(ApiResponse.success("Exam submitted and graded successfully", response));
    }
    
    @GetMapping("/attempts/{attemptId}")
    @Operation(summary = "Get attempt details",
               description = "View attempt details including answers and scores")
    public ResponseEntity<ApiResponse<ExamAttemptResponse>> getAttemptById(
            @PathVariable String attemptId) {
        
        ExamAttemptResponse response = attemptService.getAttemptById(attemptId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
    
    @GetMapping("/attempts/my-attempts")
    @Operation(summary = "Get my exam attempts",
               description = "Get all attempts by current student")
    public ResponseEntity<ApiResponse<Page<ExamAttemptResponse>>> getMyAttempts(
            @RequestHeader(value = "X-User-Id", defaultValue = "student1") String userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        
        Pageable pageable = PageRequest.of(page, size, Sort.by("startTime").descending());
        Page<ExamAttemptResponse> response = attemptService.getMyAttempts(userId, pageable);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
    
    @GetMapping("/exams/{examId}/attempts")
    @Operation(summary = "Get all attempts for exam (Instructor)",
               description = "View all student attempts for a specific exam")
    public ResponseEntity<ApiResponse<Page<ExamAttemptResponse>>> getAttemptsByExam(
            @PathVariable String examId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        
        Pageable pageable = PageRequest.of(page, size, Sort.by("submittedAt").descending());
        Page<ExamAttemptResponse> response = attemptService.getAttemptsByExam(examId, pageable);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
    
    @GetMapping("/attempts/{attemptId}/review")
    @Operation(summary = "Review exam results",
               description = "View detailed results including correct answers and explanations")
    public ResponseEntity<ApiResponse<ExamAttemptResponse>> reviewAttempt(
            @PathVariable String attemptId,
            @RequestHeader(value = "X-User-Id", defaultValue = "student1") String userId) {
        
        ExamAttemptResponse response = attemptService.getAttemptForReview(attemptId, userId);
        return ResponseEntity.ok(ApiResponse.success("Exam review", response));
    }
}
