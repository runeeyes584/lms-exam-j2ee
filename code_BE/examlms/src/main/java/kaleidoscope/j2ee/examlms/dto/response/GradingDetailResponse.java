package kaleidoscope.j2ee.examlms.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.HashMap;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GradingDetailResponse {
    
    private String attemptId;
    private String examId;
    private String studentId;
    private Double autoGradedScore;
    private Double manualGradedScore;
    private Double totalScore;
    private Integer totalQuestions;
    private Integer gradedQuestions;
    private Integer pendingQuestions;
    
    // Map: questionId -> QuestionGradeDetail
    @Builder.Default
    private Map<String, QuestionGradeDetail> questionGrades = new HashMap<>();
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class QuestionGradeDetail {
        private String questionId;
        private String questionContent;
        private String studentAnswer; // Formatted answer for display
        private String correctAnswer;
        private Double maxPoints;
        private Double earnedPoints;
        private Boolean isAutoGraded;
        private Boolean needsManualReview;
        private String feedback;
        private Boolean accepted;
    }
}
