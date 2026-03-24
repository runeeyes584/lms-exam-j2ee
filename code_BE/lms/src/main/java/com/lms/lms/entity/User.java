package com.lms.lms.entity;

import java.time.Instant;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import com.lms.lms.entity.enums.Gender;
import com.lms.lms.entity.enums.Role;

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

    private String phoneNumber;

    private String dateOfBirth;

    private String address;

    private Gender gender;

    private String schoolId;

    private Instant createdAt;

    private Instant updatedAt;
}
