package com.lms.exam.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Service;

/**
 * EnrollmentService - Kiểm tra user đã mua khóa học chưa.
 */
@Service
public class EnrollmentService {

    private final MongoTemplate mongoTemplate;

    @Autowired
    public EnrollmentService(MongoTemplate mongoTemplate) {
        this.mongoTemplate = mongoTemplate;
    }

    /**
     * Kiểm tra user đã enroll (mua) khóa học chưa.
     * Query từ collection "enrollments".
     */
    public boolean hasUserPurchasedCourse(String userId, String courseId) {
        Query query = Query.query(
                Criteria.where("userId").is(userId)
                        .and("courseId").is(courseId)
        );
        return mongoTemplate.exists(query, "enrollments");
    }
}
