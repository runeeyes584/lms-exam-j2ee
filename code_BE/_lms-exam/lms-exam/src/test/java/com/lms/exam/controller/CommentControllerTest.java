package com.lms.exam.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.lms.exam.dto.request.CommentRequest;
import com.lms.exam.dto.response.CommentResponse;
import com.lms.exam.service.CommentService;
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
import java.util.List;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(CommentController.class)
class CommentControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private CommentService commentService;

    private CommentResponse sampleResponse;
    private CommentRequest sampleRequest;

    @BeforeEach
    void setUp() {
        sampleResponse = new CommentResponse();
        sampleResponse.setId("comment123");
        sampleResponse.setCourseId("course123");
        sampleResponse.setLessonId("lesson123");
        sampleResponse.setUserId("user123");
        sampleResponse.setUserName("Test User");
        sampleResponse.setContent("This is a test comment");
        sampleResponse.setReplyCount(0);
        sampleResponse.setCreatedAt(Instant.now());

        sampleRequest = new CommentRequest();
        sampleRequest.setCourseId("course123");
        sampleRequest.setLessonId("lesson123");
        sampleRequest.setUserId("user123");
        sampleRequest.setUserName("Test User");
        sampleRequest.setContent("This is a test comment");
    }

    @Test
    void createComment_Success() throws Exception {
        when(commentService.create(any(CommentRequest.class))).thenReturn(sampleResponse);

        mockMvc.perform(post("/api/comments")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(sampleRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.id").value("comment123"))
                .andExpect(jsonPath("$.data.content").value("This is a test comment"));

        verify(commentService).create(any(CommentRequest.class));
    }

    @Test
    void createComment_ValidationError_MissingContent() throws Exception {
        sampleRequest.setContent(null);

        mockMvc.perform(post("/api/comments")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(sampleRequest)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void listComments_Success() throws Exception {
        Page<CommentResponse> page = new PageImpl<>(Collections.singletonList(sampleResponse), PageRequest.of(0, 10), 1);
        when(commentService.listByCourse(eq("course123"), isNull(), any())).thenReturn(page);

        mockMvc.perform(get("/api/comments/course/course123")
                        .param("page", "0")
                        .param("size", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.content[0].id").value("comment123"));

        verify(commentService).listByCourse(eq("course123"), isNull(), any());
    }

    @Test
    void listComments_WithLessonId() throws Exception {
        Page<CommentResponse> page = new PageImpl<>(Collections.singletonList(sampleResponse), PageRequest.of(0, 10), 1);
        when(commentService.listByCourse(eq("course123"), eq("lesson123"), any())).thenReturn(page);

        mockMvc.perform(get("/api/comments/course/course123")
                        .param("lessonId", "lesson123")
                        .param("page", "0")
                        .param("size", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));

        verify(commentService).listByCourse(eq("course123"), eq("lesson123"), any());
    }

    @Test
    void getReplies_Success() throws Exception {
        CommentResponse reply = new CommentResponse();
        reply.setId("reply123");
        reply.setParentId("comment123");
        reply.setContent("This is a reply");

        when(commentService.getReplies("comment123")).thenReturn(List.of(reply));

        mockMvc.perform(get("/api/comments/comment123/replies"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data[0].id").value("reply123"));

        verify(commentService).getReplies("comment123");
    }

    @Test
    void getCommentWithReplies_Success() throws Exception {
        sampleResponse.setReplies(Collections.emptyList());
        when(commentService.getWithReplies("comment123")).thenReturn(sampleResponse);

        mockMvc.perform(get("/api/comments/comment123"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.id").value("comment123"));

        verify(commentService).getWithReplies("comment123");
    }

    @Test
    void updateComment_Success() throws Exception {
        sampleResponse.setContent("Updated content");
        when(commentService.update(eq("comment123"), eq("user123"), eq("Updated content")))
                .thenReturn(sampleResponse);

        mockMvc.perform(put("/api/comments/comment123")
                        .param("userId", "user123")
                        .param("content", "Updated content"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));

        verify(commentService).update("comment123", "user123", "Updated content");
    }

    @Test
    void deleteComment_Success() throws Exception {
        doNothing().when(commentService).delete("comment123", "user123");

        mockMvc.perform(delete("/api/comments/comment123")
                        .param("userId", "user123"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));

        verify(commentService).delete("comment123", "user123");
    }
}
