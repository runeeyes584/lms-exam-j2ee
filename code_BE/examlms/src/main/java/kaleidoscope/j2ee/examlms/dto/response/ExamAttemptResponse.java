package kaleidoscope.j2ee.examlms.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import kaleidoscope.j2ee.examlms.entity.AttemptStatus;
import kaleidoscope.j2ee.examlms.entity.StudentAnswer;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ExamAttemptResponse {
    private String id;
    private String examId;
    private String studentId;
    private String studentName;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private LocalDateTime submittedAt;
    private List<StudentAnswer> answers;
    private Double totalScore;
    private Double autoGradedScore;
    private Double manualGradedScore;
    private Double totalMaxScore;
    private Double percentage;
    private Double scoreOnTen;
    private Integer correctAnswers;
    private Integer totalQuestions;
    private Long completionSeconds;
    private Boolean passed;
    private String examTitle;
    private AttemptStatus status;
    private String gradedBy;
    private LocalDateTime gradedAt;
    private List<QuestionResult> questionResults = new ArrayList<>();

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class QuestionResult {
        private String questionId;
        private String questionContent;
        private List<String> selectedOptionIds;
        private List<String> correctOptionIds;
        @JsonProperty("isCorrect")
        private boolean isCorrect;
        private Double earnedScore;
        private Double maxScore;
        private String explanation;
    }
}
