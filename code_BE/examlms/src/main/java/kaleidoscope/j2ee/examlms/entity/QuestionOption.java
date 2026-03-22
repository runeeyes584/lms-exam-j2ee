package kaleidoscope.j2ee.examlms.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class QuestionOption {
    private String text;
    private String imageUrl;
    private Boolean isCorrect; // Changed from boolean to Boolean to accept null
}
