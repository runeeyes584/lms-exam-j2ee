package kaleidoscope.j2ee.examlms.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import kaleidoscope.j2ee.examlms.entity.DifficultyLevel;
import kaleidoscope.j2ee.examlms.entity.QuestionOption;
import kaleidoscope.j2ee.examlms.entity.QuestionType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class QuestionCreateRequest {
    
    @NotNull(message = "Question type is required")
    private QuestionType type;
    
    @NotBlank(message = "Question content is required")
    private String content;
    
    private String imageUrl;
    
    private List<QuestionOption> options = new ArrayList<>();
    
    private String correctAnswer; // For FILL_IN type
    
    private String explanation;
    
    @NotNull(message = "Difficulty level is required")
    private DifficultyLevel difficulty;
    
    private List<String> topics = new ArrayList<>();
    
    @NotNull(message = "Points is required")
    private Double points;
}
