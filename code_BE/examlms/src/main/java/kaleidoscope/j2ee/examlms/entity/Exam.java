package kaleidoscope.j2ee.examlms.entity;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "exams")
public class Exam {

    @Id
    private String id;

    @Field("title")
    private String title;

    @Field("description")
    private String description;

    @Field("course_id")
    private String courseId;

    @Field("duration")
    private Integer duration; // In minutes

    @Field("passing_score")
    private Double passingScore;

    @Field("total_points")
    private Double totalPoints;

    @Field("questions")
    private List<ExamQuestion> questions = new ArrayList<>();

    @Field("generation_type")
    private GenerationType generationType;

    @Field("is_published")
    private Boolean isPublished = false;

    @Field("created_by")
    private String createdBy;

    @Field("created_at")
    private LocalDateTime createdAt;

    @Field("updated_at")
    private LocalDateTime updatedAt;
}
