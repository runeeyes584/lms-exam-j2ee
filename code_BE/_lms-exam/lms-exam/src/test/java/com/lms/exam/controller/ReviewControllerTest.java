package com.lms.exam.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.lms.exam.dto.request.ReviewRequest;
import com.lms.exam.dto.response.ReviewResponse;
import com.lms.exam.service.ReviewService;
import org.bson.Document;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.Instant;
import java.util.Collections;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(ReviewController.class)
class ReviewControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private ReviewService reviewService;

    private ReviewResponse sampleResponse;
    private ReviewRequest sampleRequest;

    @BeforeEach
    void setUp() {
        sampleResponse = new ReviewResponse();
        sampleResponse.setId("review123");
        sampleResponse.setCourseId("course123");
        sampleResponse.setUserId("user123");
        sampleResponse.setRating(5);
        sampleResponse.setComment("Great course!");
        sampleResponse.setCreatedAt(Instant.now());

        sampleRequest = new ReviewRequest();
        sampleRequest.setCourseId("course123");
        sampleRequest.setUserId("user123");
        sampleRequest.setRating(5);
        sampleRequest.setComment("Great course!");
    }

    @Test
    void createReview_Success() throws Exception {
        when(reviewService.createReview(any(ReviewRequest.class))).thenReturn(sampleResponse);

        mockMvc.perform(post("/api/reviews")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(sampleRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.id").value("review123"))
                .andExpect(jsonPath("$.data.rating").value(5));

        verify(reviewService).createReview(any(ReviewRequest.class));
    }

    @Test
    void createReview_ValidationError_InvalidRating() throws Exception {
        sampleRequest.setRating(6); // Invalid rating > 5

        mockMvc.perform(post("/api/reviews")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(sampleRequest)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void listReviews_Success() throws Exception {
        Page<ReviewResponse> page = new PageImpl<>(Collections.singletonList(sampleResponse), PageRequest.of(0, 10), 1);
        when(reviewService.listReviews(eq("course123"), any())).thenReturn(page);

        mockMvc.perform(get("/api/reviews/course/course123")
                        .param("page", "0")
                        .param("size", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.content[0].id").value("review123"));

        verify(reviewService).listReviews(eq("course123"), any());
    }

    @Test
    void getCourseStats_Success() throws Exception {
        Document stats = new Document("avgRating", 4.5).append("count", 10);
        when(reviewService.getCourseStats("course123")).thenReturn(stats);

        mockMvc.perform(get("/api/reviews/course/course123/stats"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));

        verify(reviewService).getCourseStats("course123");
    }

    @Test
    void getReviewById_Success() throws Exception {
        when(reviewService.getById("review123")).thenReturn(sampleResponse);

        mockMvc.perform(get("/api/reviews/review123"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.id").value("review123"));

        verify(reviewService).getById("review123");
    }

    @Test
    void updateReview_Success() throws Exception {
        when(reviewService.updateReview(eq("review123"), eq("user123"), eq(4), eq("Updated comment")))
                .thenReturn(sampleResponse);

        mockMvc.perform(put("/api/reviews/review123")
                        .param("userId", "user123")
                        .param("rating", "4")
                        .param("comment", "Updated comment"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));

        verify(reviewService).updateReview("review123", "user123", 4, "Updated comment");
    }

    @Test
    void deleteReview_Success() throws Exception {
        doNothing().when(reviewService).deleteReview("review123", "user123");

        mockMvc.perform(delete("/api/reviews/review123")
                        .param("userId", "user123"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));

        verify(reviewService).deleteReview("review123", "user123");
    }
}
