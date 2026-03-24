package com.lms.exam.service;

import com.lms.exam.dto.request.CommentRequest;
import com.lms.exam.exception.BusinessException;
import com.lms.exam.exception.ResourceNotFoundException;
import com.lms.exam.model.Comment;
import com.lms.exam.repository.CommentRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.data.mongodb.core.MongoTemplate;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

public class CommentServiceTest {

    @Mock
    CommentRepository commentRepository;

    @Mock
    MongoTemplate mongoTemplate;

    @InjectMocks
    CommentService commentService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void create_topLevelComment_success() {
        CommentRequest req = new CommentRequest();
        req.setCourseId("course1");
        req.setUserId("user1");
        req.setUserName("John");
        req.setContent("Great course!");

        when(commentRepository.save(any(Comment.class))).thenAnswer(inv -> inv.getArgument(0));

        var resp = commentService.create(req);

        assertNotNull(resp);
        assertEquals("course1", resp.getCourseId());
        assertEquals("user1", resp.getUserId());
        assertEquals("Great course!", resp.getContent());
        verify(commentRepository, times(1)).save(any(Comment.class));
    }

    @Test
    void create_replyToDeletedComment_throws() {
        CommentRequest req = new CommentRequest();
        req.setCourseId("course1");
        req.setUserId("user1");
        req.setContent("Reply");
        req.setParentId("parent123");

        Comment deletedParent = new Comment();
        deletedParent.setDeleted(true);
        when(commentRepository.findById("parent123")).thenReturn(Optional.of(deletedParent));

        assertThrows(BusinessException.class, () -> commentService.create(req));
    }

    @Test
    void update_notOwner_throws() {
        Comment c = new Comment();
        c.setUserId("owner1");
        c.setContent("Original");
        when(commentRepository.findById("c1")).thenReturn(Optional.of(c));

        assertThrows(BusinessException.class, () -> 
            commentService.update("c1", "otherUser", "New content"));
    }

    @Test
    void delete_notOwner_throws() {
        Comment c = new Comment();
        c.setUserId("owner1");
        when(commentRepository.findById("c1")).thenReturn(Optional.of(c));

        assertThrows(BusinessException.class, () -> 
            commentService.delete("c1", "otherUser"));
    }

    @Test
    void getWithReplies_deletedComment_throws() {
        Comment c = new Comment();
        c.setDeleted(true);
        when(commentRepository.findById("c1")).thenReturn(Optional.of(c));

        assertThrows(ResourceNotFoundException.class, () -> commentService.getWithReplies("c1"));
    }
}
