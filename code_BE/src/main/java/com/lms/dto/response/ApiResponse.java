package com.lms.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Standard API response wrapper used across all endpoints.
 * Code 1000 = success, 9999 = general error.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ApiResponse<T> {

    private int code;
    private String message;
    private T result;

    // ------------------------------------------------------------------ //
    // Static factory helpers
    // ------------------------------------------------------------------ //

    public static <T> ApiResponse<T> success(T result) {
        return ApiResponse.<T>builder()
                .code(1000)
                .message("Success")
                .result(result)
                .build();
    }

    public static <T> ApiResponse<T> success(String message, T result) {
        return ApiResponse.<T>builder()
                .code(1000)
                .message(message)
                .result(result)
                .build();
    }

    public static <T> ApiResponse<T> error(int code, String message) {
        return ApiResponse.<T>builder()
                .code(code)
                .message(message)
                .result(null)
                .build();
    }
}
