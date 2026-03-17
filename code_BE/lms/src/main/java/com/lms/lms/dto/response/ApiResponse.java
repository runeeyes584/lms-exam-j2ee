package com.lms.lms.dto.response;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder

public class ApiResponse<T> {
    private int code;
    private String message;
    private T result;
}
