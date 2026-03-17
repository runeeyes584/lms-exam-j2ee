package com.lms.lms.utils;

import com.lms.lms.dto.response.ApiResponse;

public final class ApiResponseUtil {
    private ApiResponseUtil() {
    }

    public static <T> ApiResponse<T> success(String message, T result) {
        return ApiResponse.<T>builder()
                .code(ResponseCode.SUCCESS)
                .message(message)
                .result(result)
                .build();
    }

    public static <T> ApiResponse<T> success(T result) {
        return success("Success", result);
    }

    public static <T> ApiResponse<T> error(int code, String message) {
        return ApiResponse.<T>builder()
                .code(code)
                .message(message)
                .result(null)
                .build();
    }
}
