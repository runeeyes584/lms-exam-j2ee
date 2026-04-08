package com.lms.exam.model;

import java.time.Instant;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

/**
 * Review entity - Đánh giá khóa học
 * Logic: User đã mua khóa học mới được đánh giá (1-5 sao).
 * Unique constraint: 1 user chỉ được 1 review cho 1 course.
 */
@Document(collection = "reviews")
@CompoundIndex(def = "{ 'courseId': 1, 'userId': 1 }", name = "course_user_idx", unique = true)
public class Review {

    @Id
    private String id;

    @Indexed
    private String courseId;

    @Indexed
    private String userId;
    private String userName; // Denormalized for display
    private String userAvatar; // Denormalized for display

    private int rating; // 1-5
    private String comment;

    // Soft-delete & audit fields
    private boolean isDeleted = false;
    private String deletedBy;
    private Instant deletedAt;

    private Instant createdAt = Instant.now();
    private Instant updatedAt = Instant.now();

    public Review() {}

    public Review(String courseId, String userId, int rating, String comment) {
        this.courseId = courseId;
        this.userId = userId;
        this.rating = rating;
        this.comment = comment;
    }

    // Getters & Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getCourseId() { return courseId; }
    public void setCourseId(String courseId) { this.courseId = courseId; }
    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }
    public String getUserName() { return userName; }
    public void setUserName(String userName) { this.userName = userName; }
    public String getUserAvatar() { return userAvatar; }
    public void setUserAvatar(String userAvatar) { this.userAvatar = userAvatar; }
    public int getRating() { return rating; }
    public void setRating(int rating) { this.rating = rating; }
    public String getComment() { return comment; }
    public void setComment(String comment) { this.comment = comment; }
    public boolean isDeleted() { return isDeleted; }
    public void setDeleted(boolean deleted) { isDeleted = deleted; }
    public String getDeletedBy() { return deletedBy; }
    public void setDeletedBy(String deletedBy) { this.deletedBy = deletedBy; }
    public Instant getDeletedAt() { return deletedAt; }
    public void setDeletedAt(Instant deletedAt) { this.deletedAt = deletedAt; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}
