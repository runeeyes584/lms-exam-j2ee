package kaleidoscope.j2ee.examlms.dto.response;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GradingDetailResponse {
    
    private String attemptId;
    private String examId;
    private String examTitle;
    private String studentId;
    private String studentName;
    private String studentEmail;
    private Double totalScore;
    private Double maxScore;
    private Double percentage;
    private String status;
    private Boolean passed;
    private LocalDateTime submittedAt;
    private LocalDateTime gradedAt;
    private String gradedBy;

    @Builder.Default
    private List<QuestionGradeDetail> questionGrades = new ArrayList<>();
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class QuestionGradeDetail {
        private String questionId;
        private String questionContent;
        private String questionType;
        private Double maxPoints;
        private Double earnedPoints;
        private List<String> selectedOptions;
        private List<String> correctOptions;
        private Boolean isCorrect;
        private String feedback;
    }
}
