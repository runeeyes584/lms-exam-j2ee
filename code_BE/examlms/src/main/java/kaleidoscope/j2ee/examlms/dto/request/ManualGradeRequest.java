package kaleidoscope.j2ee.examlms.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.HashMap;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ManualGradeRequest {
    
    @NotBlank(message = "Attempt ID is required")
    private String attemptId;
    
    @NotNull(message = "Question scores are required")
    private Map<String, Double> questionScores = new HashMap<>();
    
    // Map: questionId -> score
    // Example: { "q1": 5.0, "q2": 3.5 }
}
