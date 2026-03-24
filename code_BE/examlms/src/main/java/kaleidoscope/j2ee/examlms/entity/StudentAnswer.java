package kaleidoscope.j2ee.examlms.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class StudentAnswer {
    private String questionId;
    private List<Integer> selectedOptions = new ArrayList<>(); // For MC questions
    private String fillAnswer; // For FILL_IN questions
}
