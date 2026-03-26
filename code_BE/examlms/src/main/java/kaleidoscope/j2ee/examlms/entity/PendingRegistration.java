package kaleidoscope.j2ee.examlms.entity;

import java.time.Instant;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Document(collection = "pending_registrations")
public class PendingRegistration {
    @Id
    private String id;

    @Indexed(unique = true)
    private String email;

    private String passwordHash;

    private String fullName;

    private String otpCode;

    private Instant otpExpiresAt;

    private Instant resendAvailableAt;

    private Instant createdAt;

    private Instant updatedAt;
}
