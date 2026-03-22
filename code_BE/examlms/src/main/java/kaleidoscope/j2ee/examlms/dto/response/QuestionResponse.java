package kaleidoscope.j2ee.examlms.dto.response;

import kaleidoscope.j2ee.examlms.entity.DifficultyLevel;
import kaleidoscope.j2ee.examlms.entity.QuestionOption;
import kaleidoscope.j2ee.examlms.entity.QuestionType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class QuestionResponse {
    private String id;
    private QuestionType type;
    private String content;
    private String imageUrl;
    private List<QuestionOption> options;
    private String correctAnswer; // Only for instructor/admin
    private String explanation;
    private DifficultyLevel difficulty;
    private List<String> topics;
    private Double points;
    private String createdBy;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
