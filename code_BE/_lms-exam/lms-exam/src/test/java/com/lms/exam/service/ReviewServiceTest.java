package com.lms.exam.service;

import com.lms.exam.dto.request.ReviewRequest;
import com.lms.exam.model.Review;
import com.lms.exam.repository.ReviewRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.data.mongodb.core.MongoTemplate;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

public class ReviewServiceTest {

    @Mock
    ReviewRepository reviewRepository;

    @Mock
    MongoTemplate mongoTemplate;

    @Mock
    EnrollmentService enrollmentService;

    @InjectMocks
    ReviewService reviewService;

    @BeforeEach
    public void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    public void createReview_whenNotPurchased_throws() {
        ReviewRequest req = new ReviewRequest();
        req.setCourseId("course1");
        req.setUserId("user1");
        req.setRating(5);

        when(enrollmentService.hasUserPurchasedCourse("user1", "course1")).thenReturn(false);

        IllegalStateException ex = assertThrows(IllegalStateException.class, () -> reviewService.createReview(req));
        assertEquals("User has not purchased the course", ex.getMessage());
    }

    @Test
    public void createReview_whenAlreadyReviewed_throws() {
        ReviewRequest req = new ReviewRequest();
        req.setCourseId("course1");
        req.setUserId("user1");
        req.setRating(4);

        when(enrollmentService.hasUserPurchasedCourse("user1", "course1")).thenReturn(true);
        when(reviewRepository.findByCourseIdAndUserIdAndIsDeletedFalse("course1", "user1")).thenReturn(Optional.of(new Review()));

        IllegalStateException ex = assertThrows(IllegalStateException.class, () -> reviewService.createReview(req));
        assertEquals("User has already reviewed this course", ex.getMessage());
    }
}
