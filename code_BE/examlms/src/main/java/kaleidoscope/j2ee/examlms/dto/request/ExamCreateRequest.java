package kaleidoscope.j2ee.examlms.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import kaleidoscope.j2ee.examlms.entity.ExamQuestion;
import kaleidoscope.j2ee.examlms.entity.GenerationType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ExamCreateRequest {
    
    @NotBlank(message = "Exam title is required")
    private String title;
    
    private String description;
    
    private String courseId;
    
    @NotNull(message = "Duration is required")
    private Integer duration; // In minutes
    
    private Double passingScore;
    
    @NotNull(message = "At least one question is required")
    private List<ExamQuestion> questions = new ArrayList<>();
    
    private GenerationType generationType = GenerationType.MANUAL;

    private Boolean allowResultReview = true;
}
