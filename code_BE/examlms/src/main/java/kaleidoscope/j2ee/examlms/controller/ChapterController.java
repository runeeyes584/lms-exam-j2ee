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
import kaleidoscope.j2ee.examlms.dto.request.ChapterRequest;
import kaleidoscope.j2ee.examlms.dto.response.ApiResponse;
import kaleidoscope.j2ee.examlms.dto.response.ChapterResponse;
import kaleidoscope.j2ee.examlms.service.ChapterService;
import lombok.RequiredArgsConstructor;

/**
 * REST controller for Chapter management.
 * Chapters belong to a Course.
 */
@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class ChapterController {

    private final ChapterService chapterService;

    /** GET /api/v1/courses/{courseId}/chapters — List chapters of a course */
    @GetMapping("/courses/{courseId}/chapters")
    public ResponseEntity<ApiResponse<List<ChapterResponse>>> getChapters(@PathVariable String courseId) {
        return ResponseEntity.ok(ApiResponse.success(chapterService.getChaptersByCourse(courseId)));
    }

    /** POST /api/v1/chapters — Create a chapter */
    @PostMapping("/chapters")
    public ResponseEntity<ApiResponse<ChapterResponse>> createChapter(@Valid @RequestBody ChapterRequest request) {
        ChapterResponse created = chapterService.createChapter(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Chapter created successfully", created));
    }

    /** PUT /api/v1/chapters/{id} — Update a chapter */
    @PutMapping("/chapters/{id}")
    public ResponseEntity<ApiResponse<ChapterResponse>> updateChapter(
            @PathVariable String id,
            @Valid @RequestBody ChapterRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Chapter updated", chapterService.updateChapter(id, request)));
    }

    /** DELETE /api/v1/chapters/{id} — Soft-delete a chapter */
    @DeleteMapping("/chapters/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteChapter(@PathVariable String id) {
        chapterService.deleteChapter(id);
        return ResponseEntity.ok(ApiResponse.success("Chapter deleted", null));
    }
}
