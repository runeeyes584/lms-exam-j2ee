package kaleidoscope.j2ee.examlms.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import kaleidoscope.j2ee.examlms.dto.request.QuestionCreateRequest;
import kaleidoscope.j2ee.examlms.dto.response.ApiResponse;
import kaleidoscope.j2ee.examlms.dto.response.QuestionResponse;
import kaleidoscope.j2ee.examlms.entity.DifficultyLevel;
import kaleidoscope.j2ee.examlms.entity.QuestionType;
import kaleidoscope.j2ee.examlms.service.QuestionService;
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
@RequestMapping("/api/questions")
@RequiredArgsConstructor
@Tag(name = "Question Management", description = "APIs for managing question bank")
public class QuestionController {
    
    private final QuestionService questionService;
    
    @PostMapping
    @Operation(summary = "Create a new question")
    public ResponseEntity<ApiResponse<QuestionResponse>> createQuestion(
            @Valid @RequestBody QuestionCreateRequest request,
            @RequestHeader(value = "X-User-Id", defaultValue = "admin") String userId) {
        
        QuestionResponse response = questionService.createQuestion(request, userId);
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.success("Question created successfully", response));
    }
    
    @PutMapping("/{id}")
    @Operation(summary = "Update a question")
    public ResponseEntity<ApiResponse<QuestionResponse>> updateQuestion(
            @PathVariable String id,
            @Valid @RequestBody QuestionCreateRequest request) {
        
        QuestionResponse response = questionService.updateQuestion(id, request);
        return ResponseEntity.ok(ApiResponse.success("Question updated successfully", response));
    }
    
    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a question")
    public ResponseEntity<ApiResponse<Void>> deleteQuestion(@PathVariable String id) {
        questionService.deleteQuestion(id);
        return ResponseEntity.ok(ApiResponse.success("Question deleted successfully", null));
    }
    
    @GetMapping("/{id}")
    @Operation(summary = "Get question by ID")
    public ResponseEntity<ApiResponse<QuestionResponse>> getQuestionById(@PathVariable String id) {
        QuestionResponse response = questionService.getQuestionById(id);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
    
    @GetMapping
    @Operation(summary = "Get all questions with pagination")
    public ResponseEntity<ApiResponse<Page<QuestionResponse>>> getAllQuestions(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "DESC") String direction) {
        
        Sort sort = direction.equalsIgnoreCase("ASC") 
            ? Sort.by(sortBy).ascending() 
            : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);
        
        Page<QuestionResponse> response = questionService.getAllQuestions(pageable);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
    
    @GetMapping("/search/topics")
    @Operation(summary = "Search questions by topics")
    public ResponseEntity<ApiResponse<List<QuestionResponse>>> searchByTopics(
            @RequestParam List<String> topics) {
        
        List<QuestionResponse> response = questionService.searchByTopics(topics);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
    
    @GetMapping("/search/difficulty")
    @Operation(summary = "Search questions by difficulty level")
    public ResponseEntity<ApiResponse<List<QuestionResponse>>> searchByDifficulty(
            @RequestParam DifficultyLevel difficulty) {
        
        List<QuestionResponse> response = questionService.searchByDifficulty(difficulty);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
    
    @GetMapping("/search/advanced")
    @Operation(summary = "Advanced search by topics and difficulty")
    public ResponseEntity<ApiResponse<List<QuestionResponse>>> advancedSearch(
            @RequestParam List<String> topics,
            @RequestParam DifficultyLevel difficulty) {
        
        List<QuestionResponse> response = questionService.searchByTopicsAndDifficulty(topics, difficulty);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
    
    @GetMapping("/search/type")
    @Operation(summary = "Search questions by type")
    public ResponseEntity<ApiResponse<List<QuestionResponse>>> searchByType(
            @RequestParam QuestionType type) {
        
        List<QuestionResponse> response = questionService.searchByType(type);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
    
    @GetMapping("/my-questions")
    @Operation(summary = "Get questions created by current user")
    public ResponseEntity<ApiResponse<Page<QuestionResponse>>> getMyQuestions(
            @RequestHeader(value = "X-User-Id", defaultValue = "admin") String userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<QuestionResponse> response = questionService.getQuestionsByCreator(userId, pageable);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}
