package kaleidoscope.j2ee.examlms.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ApiResponse<T> {
    private int code;
    private String message;
    private T result;

    /** Convenience constructor used by controllers: new ApiResponse<>(true/false, "msg", data) */
    public ApiResponse(boolean success, String message, T result) {
        this.code = success ? 1000 : 9999;
        this.message = message;
        this.result = result;
    }

    public static <T> ApiResponse<T> success(T data) {
        return new ApiResponse<>(1000, "Success", data);
    }

    public static <T> ApiResponse<T> success(String message, T data) {
        return new ApiResponse<>(1000, message, data);
    }

    public static <T> ApiResponse<T> error(int code, String message) {
        return new ApiResponse<>(code, message, null);
    }

    public static <T> ApiResponse<T> error(String message) {
        return new ApiResponse<>(9999, message, null);
    }
}
