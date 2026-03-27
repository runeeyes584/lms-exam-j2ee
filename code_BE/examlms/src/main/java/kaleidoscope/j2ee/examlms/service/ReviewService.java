package kaleidoscope.j2ee.examlms.service;

import static org.springframework.data.mongodb.core.aggregation.Aggregation.*;

import java.time.Instant;
import java.util.Optional;

import org.bson.types.ObjectId;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.aggregation.Aggregation;
import org.springframework.data.mongodb.core.aggregation.AggregationResults;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.stereotype.Service;

import kaleidoscope.j2ee.examlms.dto.request.ReviewRequest;
import kaleidoscope.j2ee.examlms.dto.response.ReviewResponse;
import kaleidoscope.j2ee.examlms.entity.Review;
import kaleidoscope.j2ee.examlms.exception.BusinessException;
import kaleidoscope.j2ee.examlms.exception.ResourceNotFoundException;
import kaleidoscope.j2ee.examlms.repository.ReviewRepository;

@Service
public class ReviewService {

    private static final Logger log = LoggerFactory.getLogger(ReviewService.class);

    private final ReviewRepository reviewRepository;
    private final MongoTemplate mongoTemplate;
    private final EnrollmentService enrollmentService;

    @Autowired
    public ReviewService(ReviewRepository reviewRepository, MongoTemplate mongoTemplate,
            EnrollmentService enrollmentService) {
        this.reviewRepository = reviewRepository;
        this.mongoTemplate = mongoTemplate;
        this.enrollmentService = enrollmentService;
    }

    public ReviewResponse createReview(ReviewRequest req) {
        // check purchase
        if (!enrollmentService.hasUserPurchasedCourse(req.getUserId(), req.getCourseId())) {
            throw new IllegalStateException("User has not purchased the course");
        }

        // enforce uniqueness: repository has unique index, but check to return friendly
        // error
        Optional<Review> existing = reviewRepository.findByCourseIdAndUserIdAndIsDeletedFalse(req.getCourseId(),
                req.getUserId());
        if (existing.isPresent()) {
            throw new IllegalStateException("User has already reviewed this course");
        }

        Review r = new Review();
        r.setId(new ObjectId().toString());
        r.setCourseId(req.getCourseId());
        r.setUserId(req.getUserId());
        r.setUserName(req.getUserName());
        r.setUserAvatar(req.getUserAvatar());
        r.setRating(req.getRating());
        r.setComment(req.getComment());
        r.setCreatedAt(Instant.now());
        r.setUpdatedAt(Instant.now());

        Review saved = reviewRepository.save(r);

        // recalculate avg rating and update course document
        recalcAndUpdateCourseAvg(req.getCourseId());

        return ReviewResponse.from(saved);
    }

    public org.springframework.data.domain.Page<ReviewResponse> listReviews(String courseId,
            org.springframework.data.domain.Pageable pageable) {
        org.springframework.data.domain.Page<Review> p = reviewRepository.findByCourseIdAndIsDeletedFalse(courseId,
                pageable);
        return p.map(ReviewResponse::from);
    }

    public org.bson.Document getCourseStats(String courseId) {
        Aggregation agg = newAggregation(
                match(Criteria.where("courseId").is(courseId).and("isDeleted").is(false)),
                group("courseId").avg("rating").as("avgRating").count().as("count"));
        AggregationResults<org.bson.Document> res = mongoTemplate.aggregate(agg, "reviews", org.bson.Document.class);
        org.bson.Document doc = res.getUniqueMappedResult();
        if (doc == null) {
            doc = new org.bson.Document("avgRating", 0).append("count", 0);
        }
        return doc;
    }

    private void recalcAndUpdateCourseAvg(String courseId) {
        // aggregation to compute avg and count
        Aggregation agg = newAggregation(
                match(Criteria.where("courseId").is(courseId).and("isDeleted").is(false)),
                group("courseId").avg("rating").as("avgRating").count().as("count"));

        AggregationResults<org.bson.Document> res = mongoTemplate.aggregate(agg, "reviews", org.bson.Document.class);
        org.bson.Document doc = res.getUniqueMappedResult();
        if (doc != null) {
            Double avg = doc.getDouble("avgRating");
            Integer count = doc.getInteger("count");
            // update courses collection: minimal update operation
            if (avg != null) {
                mongoTemplate.getCollection("courses").updateOne(new org.bson.Document("_id", new ObjectId(courseId)),
                        new org.bson.Document("$set",
                                new org.bson.Document("avgRating", avg).append("ratingCount", count)));
            }
        }
    }

    public ReviewResponse getById(String id) {
        Review r = reviewRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Review not found"));
        if (r.isDeleted()) {
            throw new ResourceNotFoundException("Review not found");
        }
        return ReviewResponse.from(r);
    }

    public ReviewResponse updateReview(String id, String userId, int rating, String comment) {
        Review r = reviewRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Review not found"));
        if (r.isDeleted()) {
            throw new ResourceNotFoundException("Review not found");
        }
        if (!r.getUserId().equals(userId)) {
            throw new BusinessException("Not authorized to edit this review");
        }
        r.setRating(rating);
        r.setComment(comment);
        r.setUpdatedAt(Instant.now());
        Review saved = reviewRepository.save(r);
        recalcAndUpdateCourseAvg(r.getCourseId());
        log.info("Updated review {} for course {}", id, r.getCourseId());
        return ReviewResponse.from(saved);
    }

    public void deleteReview(String id, String userId) {
        Review r = reviewRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Review not found"));
        if (r.isDeleted()) {
            return;
        }
        if (!r.getUserId().equals(userId)) {
            throw new BusinessException("Not authorized to delete this review");
        }
        r.setDeleted(true);
        r.setDeletedBy(userId);
        r.setDeletedAt(Instant.now());
        r.setUpdatedAt(Instant.now());
        reviewRepository.save(r);
        recalcAndUpdateCourseAvg(r.getCourseId());
        log.info("Soft deleted review {} for course {} by user {}", id, r.getCourseId(), userId);
    }
}
