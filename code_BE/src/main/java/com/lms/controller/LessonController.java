package com.lms.controller;

import com.lms.dto.request.LessonRequest;
import com.lms.dto.response.ApiResponse;
import com.lms.dto.response.LessonResponse;
import com.lms.service.LessonService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST controller for Lesson management.
 * Lessons belong to a Chapter.
 */
@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class LessonController {

    private final LessonService lessonService;

    /** GET /api/v1/chapters/{chapterId}/lessons — List lessons of a chapter */
    @GetMapping("/chapters/{chapterId}/lessons")
    public ResponseEntity<ApiResponse<List<LessonResponse>>> getLessons(@PathVariable String chapterId) {
        return ResponseEntity.ok(ApiResponse.success(lessonService.getLessonsByChapter(chapterId)));
    }

    /** POST /api/v1/lessons — Create a lesson */
    @PostMapping("/lessons")
    public ResponseEntity<ApiResponse<LessonResponse>> createLesson(@Valid @RequestBody LessonRequest request) {
        LessonResponse created = lessonService.createLesson(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Lesson created successfully", created));
    }

    /** PUT /api/v1/lessons/{id} — Update a lesson */
    @PutMapping("/lessons/{id}")
    public ResponseEntity<ApiResponse<LessonResponse>> updateLesson(
            @PathVariable String id,
            @Valid @RequestBody LessonRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Lesson updated", lessonService.updateLesson(id, request)));
    }

    /** DELETE /api/v1/lessons/{id} — Soft-delete a lesson */
    @DeleteMapping("/lessons/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteLesson(@PathVariable String id) {
        lessonService.deleteLesson(id);
        return ResponseEntity.ok(ApiResponse.success("Lesson deleted", null));
    }
}
