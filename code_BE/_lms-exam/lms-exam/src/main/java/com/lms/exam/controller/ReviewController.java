package com.lms.exam.controller;

import com.lms.exam.dto.ApiResponse;
import com.lms.exam.dto.request.ReviewRequest;
import com.lms.exam.dto.response.ReviewResponse;
import com.lms.exam.service.ReviewService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/reviews")
public class ReviewController {

    private final ReviewService reviewService;

    @Autowired
    public ReviewController(ReviewService reviewService) {
        this.reviewService = reviewService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ReviewResponse>> create(@Validated @RequestBody ReviewRequest req) {
        try {
            ReviewResponse resp = reviewService.createReview(req);
            return ResponseEntity.ok(new ApiResponse<>(true, "Created", resp));
        } catch (IllegalStateException ex) {
            return ResponseEntity.status(409).body(new ApiResponse<>(false, ex.getMessage(), null));
        } catch (Exception ex) {
            return ResponseEntity.status(500).body(new ApiResponse<>(false, "Internal error", null));
        }
    }

    @GetMapping("/course/{courseId}")
    public ResponseEntity<ApiResponse<Object>> list(@PathVariable String courseId,
                                                    @RequestParam(defaultValue = "0") int page,
                                                    @RequestParam(defaultValue = "20") int size) {
        org.springframework.data.domain.Pageable pageable = org.springframework.data.domain.PageRequest.of(page, size);
        org.springframework.data.domain.Page<ReviewResponse> p = reviewService.listReviews(courseId, pageable);
        return ResponseEntity.ok(new ApiResponse<>(true, "OK", p));
    }

    @GetMapping("/course/{courseId}/stats")
    public ResponseEntity<ApiResponse<Object>> stats(@PathVariable String courseId) {
        org.bson.Document doc = reviewService.getCourseStats(courseId);
        return ResponseEntity.ok(new ApiResponse<>(true, "OK", doc));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ReviewResponse>> getOne(@PathVariable String id) {
        ReviewResponse resp = reviewService.getById(id);
        return ResponseEntity.ok(new ApiResponse<>(true, "OK", resp));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ReviewResponse>> update(
            @PathVariable String id,
            @RequestBody java.util.Map<String, Object> body) {
        String userId = (String) body.get("userId");
        Integer rating = (Integer) body.get("rating");
        String comment = (String) body.get("comment");
        ReviewResponse resp = reviewService.updateReview(id, userId, rating, comment);
        return ResponseEntity.ok(new ApiResponse<>(true, "Updated", resp));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(
            @PathVariable String id,
            @RequestParam String userId) {
        reviewService.deleteReview(id, userId);
        return ResponseEntity.ok(new ApiResponse<>(true, "Deleted", null));
    }
}
