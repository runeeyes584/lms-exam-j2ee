package kaleidoscope.j2ee.examlms.controller;

import kaleidoscope.j2ee.examlms.dto.response.ApiResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/health")
public class HealthCheckController {

    @Autowired
    private MongoTemplate mongoTemplate;

    @GetMapping
    public ApiResponse<Map<String, Object>> healthCheck() {
        Map<String, Object> health = new HashMap<>();
        health.put("status", "UP");
        health.put("timestamp", LocalDateTime.now());
        health.put("service", "Exam LMS API");
        
        try {
            String dbName = mongoTemplate.getDb().getName();
            health.put("database", "Connected");
            health.put("databaseName", dbName);
        } catch (Exception e) {
            health.put("database", "Disconnected");
            health.put("error", e.getMessage());
        }
        
        return ApiResponse.success("Health check passed", health);
    }
}
