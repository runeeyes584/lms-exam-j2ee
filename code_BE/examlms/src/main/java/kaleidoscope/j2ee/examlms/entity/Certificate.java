package kaleidoscope.j2ee.examlms.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "certificate")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Certificate {

    @Id
    private String id;

    private String userId;
    private String courseId;
    private String certificateNumber;
    private String studentName;
    private String studentEmail;
    private String courseName;

    private String filePath;

    private LocalDateTime issuedAt;
}
