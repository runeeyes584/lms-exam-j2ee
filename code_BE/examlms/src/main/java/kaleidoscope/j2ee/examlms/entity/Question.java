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
@Document(collection = "questions")
public class Question {
    
    @Id
    private String id;
    
    @Field("type")
    private QuestionType type;
    
    @Field("content")
    private String content;
    
    @Field("image_url")
    private String imageUrl;
    
    @Field("options")
    private List<QuestionOption> options = new ArrayList<>();
    
    @Field("correct_answer")
    private String correctAnswer; // For FILL_IN type
    
    @Field("explanation")
    private String explanation;
    
    @Field("difficulty")
    private DifficultyLevel difficulty;
    
    @Field("topics")
    private List<String> topics = new ArrayList<>();
    
    @Field("points")
    private Double points;
    
    @Field("created_by")
    private String createdBy;
    
    @Field("created_at")
    private LocalDateTime createdAt;
    
    @Field("updated_at")
    private LocalDateTime updatedAt;
}
