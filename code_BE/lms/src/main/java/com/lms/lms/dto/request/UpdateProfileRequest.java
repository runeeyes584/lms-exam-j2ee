package com.lms.lms.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import com.lms.lms.entity.enums.Gender;

public record UpdateProfileRequest(
        @NotBlank(message = "Full name is required")
        @Size(max = 100, message = "Full name must be at most 100 characters")
        String fullName,

        @Pattern(regexp = "^(\\+84|0)[0-9]{9}$", message = "Invalid phone number")
        String phoneNumber,

        @Pattern(regexp = "^\\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\\d|3[01])$", message = "Date of birth must be in format YYYY-MM-DD")
        String dateOfBirth,

        @Size(max = 255, message = "Address must be at most 255 characters")
        String address,

        Gender gender,

        @Pattern(regexp = "^[A-Za-z0-9]{4,20}$", message = "School ID must be 4-20 alphanumeric characters")
        String schoolId) {
}