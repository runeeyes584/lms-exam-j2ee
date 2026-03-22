package kaleidoscope.j2ee.examlms.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "exam_attempts")
public class ExamAttempt {
    
    @Id
    private String id;
    
    @Field("exam_id")
    private String examId;
    
    @Field("student_id")
    private String studentId;
    
    @Field("start_time")
    private LocalDateTime startTime;
    
    @Field("end_time")
    private LocalDateTime endTime; // Calculated from start_time + duration
    
    @Field("submitted_at")
    private LocalDateTime submittedAt;
    
    @Field("answers")
    private List<StudentAnswer> answers = new ArrayList<>();
    
    @Field("total_score")
    private Double totalScore;
    
    @Field("auto_graded_score")
    private Double autoGradedScore;
    
    @Field("manual_graded_score")
    private Double manualGradedScore;
    
    @Field("status")
    private AttemptStatus status;
    
    @Field("graded_by")
    private String gradedBy;
    
    @Field("graded_at")
    private LocalDateTime gradedAt;
}
