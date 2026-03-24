package com.lms.exam.dto.response;

import com.lms.exam.model.Comment;

import java.time.Instant;
import java.util.List;

public class CommentResponse {

    private String id;
    private String courseId;
    private String lessonId;
    private String userId;
    private String userName;
    private String content;
    private String parentId;
    private int replyCount;
    private Instant createdAt;
    private Instant updatedAt;

    // Nested replies (optional, loaded on demand)
    private List<CommentResponse> replies;

    public static CommentResponse from(Comment c) {
        CommentResponse r = new CommentResponse();
        r.setId(c.getId());
        r.setCourseId(c.getCourseId());
        r.setLessonId(c.getLessonId());
        r.setUserId(c.getUserId());
        r.setUserName(c.getUserName());
        r.setContent(c.getContent());
        r.setParentId(c.getParentId());
        r.setReplyCount(c.getReplyCount());
        r.setCreatedAt(c.getCreatedAt());
        r.setUpdatedAt(c.getUpdatedAt());
        return r;
    }

    // Getters and setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getCourseId() { return courseId; }
    public void setCourseId(String courseId) { this.courseId = courseId; }

    public String getLessonId() { return lessonId; }
    public void setLessonId(String lessonId) { this.lessonId = lessonId; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public String getUserName() { return userName; }
    public void setUserName(String userName) { this.userName = userName; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    public String getParentId() { return parentId; }
    public void setParentId(String parentId) { this.parentId = parentId; }

    public int getReplyCount() { return replyCount; }
    public void setReplyCount(int replyCount) { this.replyCount = replyCount; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }

    public List<CommentResponse> getReplies() { return replies; }
    public void setReplies(List<CommentResponse> replies) { this.replies = replies; }
}
