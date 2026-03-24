package com.lms.exam.controller;

import com.lms.exam.service.AnalyticsService;
import org.bson.Document;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Arrays;
import java.util.List;

import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(AnalyticsController.class)
class AnalyticsControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private AnalyticsService analyticsService;

    @Test
    void getRevenueByMonth_Success() throws Exception {
        List<Document> revenue = Arrays.asList(
                new Document("_id", new Document("year", 2024).append("month", 1)).append("total", 50000.0),
                new Document("_id", new Document("year", 2024).append("month", 2)).append("total", 75000.0)
        );
        when(analyticsService.getRevenueByMonth(2024)).thenReturn(revenue);

        mockMvc.perform(get("/api/analytics/revenue")
                        .param("year", "2024"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data").isArray());

        verify(analyticsService).getRevenueByMonth(2024);
    }

    @Test
    void getTopCourses_Success() throws Exception {
        List<Document> topCourses = Arrays.asList(
                new Document("_id", "course1").append("enrollments", 100),
                new Document("_id", "course2").append("enrollments", 80)
        );
        when(analyticsService.getTopCoursesByEnrollment(10)).thenReturn(topCourses);

        mockMvc.perform(get("/api/analytics/top-courses")
                        .param("limit", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data").isArray());

        verify(analyticsService).getTopCoursesByEnrollment(10);
    }

    @Test
    void getTopCourses_DefaultLimit() throws Exception {
        List<Document> topCourses = Arrays.asList(
                new Document("_id", "course1").append("enrollments", 100)
        );
        when(analyticsService.getTopCoursesByEnrollment(10)).thenReturn(topCourses);

        mockMvc.perform(get("/api/analytics/top-courses"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));

        verify(analyticsService).getTopCoursesByEnrollment(10);
    }

    @Test
    void getNewUsers_Success() throws Exception {
        List<Document> newUsers = Arrays.asList(
                new Document("_id", new Document("year", 2024).append("month", 1)).append("count", 50),
                new Document("_id", new Document("year", 2024).append("month", 2)).append("count", 75)
        );
        when(analyticsService.getNewUsersByMonth(2024)).thenReturn(newUsers);

        mockMvc.perform(get("/api/analytics/new-users")
                        .param("year", "2024"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data").isArray());

        verify(analyticsService).getNewUsersByMonth(2024);
    }

    @Test
    void getDashboardSummary_Success() throws Exception {
        Document summary = new Document("totalUsers", 1000)
                .append("totalCourses", 50)
                .append("totalEnrollments", 5000)
                .append("totalRevenue", 100000.0);
        when(analyticsService.getDashboardSummary()).thenReturn(summary);

        mockMvc.perform(get("/api/analytics/dashboard"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.totalUsers").value(1000))
                .andExpect(jsonPath("$.data.totalCourses").value(50));

        verify(analyticsService).getDashboardSummary();
    }
}
