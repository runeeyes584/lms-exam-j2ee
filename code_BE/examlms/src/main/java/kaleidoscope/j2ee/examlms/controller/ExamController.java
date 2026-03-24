package kaleidoscope.j2ee.examlms.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import kaleidoscope.j2ee.examlms.dto.request.ExamCreateRequest;
import kaleidoscope.j2ee.examlms.dto.request.ExamGenerateRequest;
import kaleidoscope.j2ee.examlms.dto.response.ApiResponse;
import kaleidoscope.j2ee.examlms.dto.response.ExamResponse;
import kaleidoscope.j2ee.examlms.service.ExamGeneratorService;
import kaleidoscope.j2ee.examlms.service.ExamService;
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
@RequestMapping("/api/exams")
@RequiredArgsConstructor
@Tag(name = "Exam Management", description = "APIs for managing exams and auto-generation")
public class ExamController {
    
    private final ExamService examService;
    private final ExamGeneratorService examGeneratorService;
    
    @PostMapping
    @Operation(summary = "Create exam manually",
               description = "Create an exam by manually selecting questions")
    public ResponseEntity<ApiResponse<ExamResponse>> createExam(
            @Valid @RequestBody ExamCreateRequest request,
            @RequestHeader(value = "X-User-Id", defaultValue = "admin") String userId) {
        
        ExamResponse response = examService.createExam(request, userId);
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.success("Exam created successfully", response));
    }
    
    @PostMapping("/generate")
    @Operation(summary = "Auto-generate exam",
               description = "Generate exam automatically based on difficulty matrix and topics")
    public ResponseEntity<ApiResponse<ExamResponse>> generateExam(
            @Valid @RequestBody ExamGenerateRequest request,
            @RequestHeader(value = "X-User-Id", defaultValue = "admin") String userId) {
        
        ExamResponse response = examGeneratorService.generateExam(request, userId);
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.success("Exam generated successfully", response));
    }
    
    @PutMapping("/{id}")
    @Operation(summary = "Update exam",
               description = "Update an unpublished exam")
    public ResponseEntity<ApiResponse<ExamResponse>> updateExam(
            @PathVariable String id,
            @Valid @RequestBody ExamCreateRequest request) {
        
        ExamResponse response = examService.updateExam(id, request);
        return ResponseEntity.ok(ApiResponse.success("Exam updated successfully", response));
    }
    
    @DeleteMapping("/{id}")
    @Operation(summary = "Delete exam",
               description = "Delete an unpublished exam")
    public ResponseEntity<ApiResponse<Void>> deleteExam(@PathVariable String id) {
        examService.deleteExam(id);
        return ResponseEntity.ok(ApiResponse.success("Exam deleted successfully", null));
    }
    
    @GetMapping("/{id}")
    @Operation(summary = "Get exam by ID")
    public ResponseEntity<ApiResponse<ExamResponse>> getExamById(@PathVariable String id) {
        ExamResponse response = examService.getExamById(id);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
    
    @GetMapping
    @Operation(summary = "Get all exams with pagination")
    public ResponseEntity<ApiResponse<Page<ExamResponse>>> getAllExams(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "DESC") String direction) {
        
        Sort sort = direction.equalsIgnoreCase("ASC") 
            ? Sort.by(sortBy).ascending() 
            : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);
        
        Page<ExamResponse> response = examService.getAllExams(pageable);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
    
    @GetMapping("/course/{courseId}")
    @Operation(summary = "Get exams by course")
    public ResponseEntity<ApiResponse<List<ExamResponse>>> getExamsByCourse(
            @PathVariable String courseId) {
        
        List<ExamResponse> response = examService.getExamsByCourse(courseId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
    
    @GetMapping("/published")
    @Operation(summary = "Get all published exams")
    public ResponseEntity<ApiResponse<List<ExamResponse>>> getPublishedExams() {
        List<ExamResponse> response = examService.getPublishedExams();
        return ResponseEntity.ok(ApiResponse.success(response));
    }
    
    @PostMapping("/{id}/publish")
    @Operation(summary = "Publish exam",
               description = "Make exam available for students")
    public ResponseEntity<ApiResponse<ExamResponse>> publishExam(@PathVariable String id) {
        ExamResponse response = examService.publishExam(id);
        return ResponseEntity.ok(ApiResponse.success("Exam published successfully", response));
    }
    
    @PostMapping("/{id}/unpublish")
    @Operation(summary = "Unpublish exam",
               description = "Make exam unavailable for students")
    public ResponseEntity<ApiResponse<ExamResponse>> unpublishExam(@PathVariable String id) {
        ExamResponse response = examService.unpublishExam(id);
        return ResponseEntity.ok(ApiResponse.success("Exam unpublished successfully", response));
    }
    
    @GetMapping("/my-exams")
    @Operation(summary = "Get exams created by current user")
    public ResponseEntity<ApiResponse<Page<ExamResponse>>> getMyExams(
            @RequestHeader(value = "X-User-Id", defaultValue = "admin") String userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<ExamResponse> response = examService.getExamsByCreator(userId, pageable);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}
