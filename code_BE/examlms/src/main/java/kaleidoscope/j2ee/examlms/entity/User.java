package kaleidoscope.j2ee.examlms.entity;

import java.time.Instant;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import kaleidoscope.j2ee.examlms.entity.enums.Gender;
import kaleidoscope.j2ee.examlms.entity.enums.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "users")
@Builder
public class User {
    @Id
    private String id;

    @Indexed(unique = true)
    private String email;

    private String passwordHash;

    private String fullName;

    private String avatarUrl;

    private Role role;

    private Boolean isActive;

    private String phoneNumber;

    private String dateOfBirth;

    private String address;

    private Gender gender;

    private String schoolId;

    private Instant createdAt;

    private Instant updatedAt;
}
