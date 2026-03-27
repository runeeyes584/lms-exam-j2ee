package kaleidoscope.j2ee.examlms.controller;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import kaleidoscope.j2ee.examlms.dto.request.CommentRequest;
import kaleidoscope.j2ee.examlms.dto.response.ApiResponse;
import kaleidoscope.j2ee.examlms.dto.response.CommentResponse;
import kaleidoscope.j2ee.examlms.service.CommentService;

@RestController
@RequestMapping("/api/comments")
public class CommentController {

    private final CommentService commentService;

    @Autowired
    public CommentController(CommentService commentService) {
        this.commentService = commentService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<CommentResponse>> create(@Validated @RequestBody CommentRequest req) {
        CommentResponse resp = commentService.create(req);
        return ResponseEntity.ok(new ApiResponse<>(true, "Created", resp));
    }

    @GetMapping("/course/{courseId}")
    public ResponseEntity<ApiResponse<Page<CommentResponse>>> list(
            @PathVariable String courseId,
            @RequestParam(required = false) String lessonId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<CommentResponse> result = commentService.listByCourse(courseId, lessonId, pageable);
        return ResponseEntity.ok(new ApiResponse<>(true, "OK", result));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<CommentResponse>> getOne(@PathVariable String id) {
        CommentResponse resp = commentService.getWithReplies(id);
        return ResponseEntity.ok(new ApiResponse<>(true, "OK", resp));
    }

    @GetMapping("/{id}/replies")
    public ResponseEntity<ApiResponse<List<CommentResponse>>> replies(@PathVariable String id) {
        List<CommentResponse> replies = commentService.getReplies(id);
        return ResponseEntity.ok(new ApiResponse<>(true, "OK", replies));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<CommentResponse>> update(
            @PathVariable String id,
            @RequestBody Map<String, String> body) {
        String userId = body.get("userId");
        String content = body.get("content");
        CommentResponse resp = commentService.update(id, userId, content);
        return ResponseEntity.ok(new ApiResponse<>(true, "Updated", resp));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(
            @PathVariable String id,
            @RequestParam String userId) {
        commentService.delete(id, userId);
        return ResponseEntity.ok(new ApiResponse<>(true, "Deleted", null));
    }
}
