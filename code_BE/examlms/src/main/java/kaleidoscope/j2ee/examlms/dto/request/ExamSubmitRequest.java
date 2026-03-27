package kaleidoscope.j2ee.examlms.dto.request;

import jakarta.validation.constraints.NotNull;
import kaleidoscope.j2ee.examlms.entity.StudentAnswer;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ExamSubmitRequest {
    
    @NotNull(message = "Answers are required")
    private List<StudentAnswer> answers = new ArrayList<>();
}
