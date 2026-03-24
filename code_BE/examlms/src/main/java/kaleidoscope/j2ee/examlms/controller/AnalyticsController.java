package kaleidoscope.j2ee.examlms.controller;

import java.time.Year;
import java.util.List;

import org.bson.Document;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import kaleidoscope.j2ee.examlms.dto.response.ApiResponse;
import kaleidoscope.j2ee.examlms.service.AnalyticsService;

@RestController
@RequestMapping("/api/analytics")
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    @Autowired
    public AnalyticsController(AnalyticsService analyticsService) {
        this.analyticsService = analyticsService;
    }

    @GetMapping("/dashboard")
    public ResponseEntity<ApiResponse<Document>> dashboard() {
        Document summary = analyticsService.getDashboardSummary();
        return ResponseEntity.ok(new ApiResponse<>(true, "OK", summary));
    }

    @GetMapping("/revenue")
    public ResponseEntity<ApiResponse<List<Document>>> revenueByMonth(
            @RequestParam(defaultValue = "0") int year) {
        if (year == 0) {
            year = Year.now().getValue();
        }
        List<Document> data = analyticsService.getRevenueByMonth(year);
        return ResponseEntity.ok(new ApiResponse<>(true, "OK", data));
    }

    @GetMapping("/new-users")
    public ResponseEntity<ApiResponse<List<Document>>> newUsersByMonth(
            @RequestParam(defaultValue = "0") int year) {
        if (year == 0) {
            year = Year.now().getValue();
        }
        List<Document> data = analyticsService.getNewUsersByMonth(year);
        return ResponseEntity.ok(new ApiResponse<>(true, "OK", data));
    }

    @GetMapping("/top-courses")
    public ResponseEntity<ApiResponse<List<Document>>> topCoursesByEnrollment(
            @RequestParam(defaultValue = "10") int limit) {
        List<Document> data = analyticsService.getTopCoursesByEnrollment(limit);
        return ResponseEntity.ok(new ApiResponse<>(true, "OK", data));
    }

    @GetMapping("/courses/top-revenue")
    public ResponseEntity<ApiResponse<List<Document>>> topCoursesByRevenue(
            @RequestParam(defaultValue = "10") int limit) {
        List<Document> data = analyticsService.getTopCoursesByRevenue(limit);
        return ResponseEntity.ok(new ApiResponse<>(true, "OK", data));
    }

    @GetMapping("/courses/{courseId}")
    public ResponseEntity<ApiResponse<Document>> courseAnalytics(@PathVariable String courseId) {
        Document data = analyticsService.getCourseAnalytics(courseId);
        return ResponseEntity.ok(new ApiResponse<>(true, "OK", data));
    }
}
