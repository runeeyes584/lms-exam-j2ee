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
import kaleidoscope.j2ee.examlms.dto.request.LessonRequest;
import kaleidoscope.j2ee.examlms.dto.response.ApiResponse;
import kaleidoscope.j2ee.examlms.dto.response.LessonResponse;
import kaleidoscope.j2ee.examlms.service.LessonService;
import lombok.RequiredArgsConstructor;

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
