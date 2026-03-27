package kaleidoscope.j2ee.examlms.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class QuestionGradeRequest {
    
    @NotNull(message = "Question ID is required")
    private String questionId;
    
    @NotNull(message = "Score is required")
    @Min(value = 0, message = "Score cannot be negative")
    private Double score;
    
    private String feedback; // Optional feedback for the answer
    
    @NotNull(message = "Accept/Reject flag is required")
    private Boolean accepted; // true = accept answer, false = reject
}
