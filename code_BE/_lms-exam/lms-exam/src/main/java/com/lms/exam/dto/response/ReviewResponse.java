package com.lms.exam.dto.response;

import com.lms.exam.model.Review;
import java.time.Instant;

public class ReviewResponse {
    private String id;
    private String courseId;
    private String userId;
    private String userName;
    private String userAvatar;
    private int rating;
    private String comment;
    private Instant createdAt;
    private Instant updatedAt;

    public static ReviewResponse from(Review r) {
        ReviewResponse resp = new ReviewResponse();
        resp.setId(r.getId());
        resp.setCourseId(r.getCourseId());
        resp.setUserId(r.getUserId());
        resp.setUserName(r.getUserName());
        resp.setUserAvatar(r.getUserAvatar());
        resp.setRating(r.getRating());
        resp.setComment(r.getComment());
        resp.setCreatedAt(r.getCreatedAt());
        resp.setUpdatedAt(r.getUpdatedAt());
        return resp;
    }

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
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}
