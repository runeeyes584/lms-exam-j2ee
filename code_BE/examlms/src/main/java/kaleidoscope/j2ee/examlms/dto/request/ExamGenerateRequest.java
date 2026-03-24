package kaleidoscope.j2ee.examlms.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import kaleidoscope.j2ee.examlms.entity.DifficultyLevel;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ExamGenerateRequest {
    
    @NotNull(message = "Exam title is required")
    private String title;
    
    private String description;
    
    private String courseId;
    
    @NotNull(message = "Duration is required")
    @Min(value = 1, message = "Duration must be at least 1 minute")
    private Integer duration;
    
    private Double passingScore;
    
    @NotEmpty(message = "Topics are required for generation")
    private List<String> topics;
    
    @NotNull(message = "Difficulty distribution is required")
    private Map<DifficultyLevel, Integer> difficultyDistribution = new HashMap<>();
    
    // Example: { RECOGNIZE: 5, UNDERSTAND: 3, APPLY: 2, ANALYZE: 1 }
}
