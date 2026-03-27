package kaleidoscope.j2ee.examlms.entity;

import java.time.LocalDateTime;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Document(collection = "payments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Payment {

    @Id
    private String id;

    private String userId;
    private String courseId;
    private long amount;
    private String transactionId;
    private String vnpayResponseCode;
    private String status;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
