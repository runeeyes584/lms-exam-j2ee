package kaleidoscope.j2ee.examlms.service;

import java.time.Instant;
import java.util.List;
import java.util.stream.Collectors;

import org.bson.types.ObjectId;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.stereotype.Service;

import kaleidoscope.j2ee.examlms.dto.request.CommentRequest;
import kaleidoscope.j2ee.examlms.dto.response.CommentResponse;
import kaleidoscope.j2ee.examlms.entity.Comment;
import kaleidoscope.j2ee.examlms.exception.BusinessException;
import kaleidoscope.j2ee.examlms.exception.ResourceNotFoundException;
import kaleidoscope.j2ee.examlms.repository.CommentRepository;

@Service
public class CommentService {

    private static final Logger log = LoggerFactory.getLogger(CommentService.class);

    private final CommentRepository commentRepository;
    private final MongoTemplate mongoTemplate;

    @Autowired
    public CommentService(CommentRepository commentRepository, MongoTemplate mongoTemplate) {
        this.commentRepository = commentRepository;
        this.mongoTemplate = mongoTemplate;
    }

    public CommentResponse create(CommentRequest req) {
        Comment c = new Comment();
        c.setId(new ObjectId().toString());
        c.setCourseId(req.getCourseId());
        c.setLessonId(req.getLessonId());
        c.setUserId(req.getUserId());
        c.setUserName(req.getUserName());
        c.setContent(req.getContent());
        c.setParentId(req.getParentId());
        c.setCreatedAt(Instant.now());
        c.setUpdatedAt(Instant.now());

        // If this is a reply, increment parent's replyCount
        if (req.getParentId() != null && !req.getParentId().isBlank()) {
            Comment parent = commentRepository.findById(req.getParentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Parent comment not found"));
            if (parent.isDeleted()) {
                throw new BusinessException("Cannot reply to deleted comment");
            }
            // Atomic increment
            mongoTemplate.updateFirst(
                    Query.query(Criteria.where("_id").is(req.getParentId())),
                    new Update().inc("replyCount", 1),
                    Comment.class);
        }

        Comment saved = commentRepository.save(c);
        log.info("Created comment {} for course {} by user {}", saved.getId(), saved.getCourseId(), saved.getUserId());
        return CommentResponse.from(saved);
    }

    public Page<CommentResponse> listByCourse(String courseId, String lessonId, Pageable pageable) {
        Page<Comment> page;
        if (lessonId != null && !lessonId.isBlank()) {
            page = commentRepository.findByCourseIdAndLessonIdAndParentIdIsNullAndIsDeletedFalse(courseId, lessonId,
                    pageable);
        } else {
            page = commentRepository.findByCourseIdAndParentIdIsNullAndIsDeletedFalse(courseId, pageable);
        }
        return page.map(CommentResponse::from);
    }

    public List<CommentResponse> getReplies(String parentId) {
        List<Comment> replies = commentRepository.findByParentIdAndIsDeletedFalseOrderByCreatedAtAsc(parentId);
        return replies.stream().map(CommentResponse::from).collect(Collectors.toList());
    }

    public CommentResponse getWithReplies(String commentId) {
        Comment c = commentRepository.findById(commentId)
                .orElseThrow(() -> new ResourceNotFoundException("Comment not found"));
        if (c.isDeleted()) {
            throw new ResourceNotFoundException("Comment not found");
        }
        CommentResponse resp = CommentResponse.from(c);
        resp.setReplies(getReplies(commentId));
        return resp;
    }

    public CommentResponse update(String commentId, String userId, String newContent) {
        Comment c = commentRepository.findById(commentId)
                .orElseThrow(() -> new ResourceNotFoundException("Comment not found"));
        if (c.isDeleted()) {
            throw new ResourceNotFoundException("Comment not found");
        }
        if (!c.getUserId().equals(userId)) {
            throw new BusinessException("Not authorized to edit this comment");
        }
        c.setContent(newContent);
        c.setUpdatedAt(Instant.now());
        Comment saved = commentRepository.save(c);
        log.info("Updated comment {}", commentId);
        return CommentResponse.from(saved);
    }

    public void delete(String commentId, String userId) {
        Comment c = commentRepository.findById(commentId)
                .orElseThrow(() -> new ResourceNotFoundException("Comment not found"));
        if (c.isDeleted()) {
            return; // already deleted
        }
        // Only owner can delete (or admin - to be added later)
        if (!c.getUserId().equals(userId)) {
            throw new BusinessException("Not authorized to delete this comment");
        }
        c.setDeleted(true);
        c.setDeletedBy(userId);
        c.setDeletedAt(Instant.now());
        c.setUpdatedAt(Instant.now());
        commentRepository.save(c);

        // Decrement parent's replyCount if this was a reply
        if (c.getParentId() != null && !c.getParentId().isBlank()) {
            mongoTemplate.updateFirst(
                    Query.query(Criteria.where("_id").is(c.getParentId())),
                    new Update().inc("replyCount", -1),
                    Comment.class);
        }
        log.info("Soft deleted comment {} by user {}", commentId, userId);
    }
}
