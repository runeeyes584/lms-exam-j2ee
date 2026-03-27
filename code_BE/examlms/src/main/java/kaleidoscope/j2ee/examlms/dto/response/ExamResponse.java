package kaleidoscope.j2ee.examlms.dto.response;

import kaleidoscope.j2ee.examlms.entity.ExamQuestion;
import kaleidoscope.j2ee.examlms.entity.GenerationType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ExamResponse {
    private String id;
    private String title;
    private String description;
    private String courseId;
    private Integer duration;
    private Double passingScore;
    private Double totalPoints;
    private List<ExamQuestion> questions;
    private GenerationType generationType;
    private Boolean isPublished;
    private Boolean allowResultReview;
    private String createdBy;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
