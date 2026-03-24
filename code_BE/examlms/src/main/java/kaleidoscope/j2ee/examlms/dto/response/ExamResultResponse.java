package kaleidoscope.j2ee.examlms.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.HashMap;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ExamResultResponse {
    private String attemptId;
    private String examId;
    private String examTitle;
    private Double totalScore;
    private Double maxScore;
    private Double percentage;
    private Boolean passed;
    private Map<String, QuestionResult> questionResults = new HashMap<>();
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class QuestionResult {
        private String questionId;
        private Double score;
        private Double maxScore;
        private Boolean isCorrect;
        private String explanation;
    }
}
