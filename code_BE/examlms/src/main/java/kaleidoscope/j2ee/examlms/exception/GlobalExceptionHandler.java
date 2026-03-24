package kaleidoscope.j2ee.examlms.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import kaleidoscope.j2ee.examlms.dto.response.ApiResponse;

@RestControllerAdvice
public class GlobalExceptionHandler {

    // Catch EnrollmentException
    @ExceptionHandler(EnrollmentException.class)
    public ResponseEntity<ApiResponse<Void>> handleEnrollmentException(EnrollmentException e) {

        ApiResponse<Void> response = ApiResponse.<Void>builder()
                .code(4001)
                .message(e.getMessage())
                .build();

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }

    // Catch ProgressException
    @ExceptionHandler(ProgressException.class)
    public ResponseEntity<ApiResponse<Void>> handleProgressException(ProgressException e) {

        ApiResponse<Void> response = ApiResponse.<Void>builder()
                .code(4002)
                .message(e.getMessage())
                .build();

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }

    // Catch CertificateException
    @ExceptionHandler(CertificateException.class)
    public ResponseEntity<ApiResponse<Void>> handleCertificateException(CertificateException e) {

        ApiResponse<Void> response = ApiResponse.<Void>builder()
                .code(4003)
                .message(e.getMessage())
                .build();

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }

    // Catch validation errors (@NotBlank, @Valid...)
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<Void>> handleValidationException(MethodArgumentNotValidException e) {

        String message = e.getBindingResult()
                .getFieldErrors()
                .stream()
                .map(error -> error.getField() + ": " + error.getDefaultMessage())
                .findFirst()
                .orElse("Validation failed");

        ApiResponse<Void> response = ApiResponse.<Void>builder()
                .code(4000)
                .message(message)
                .build();

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }

    // Catch RuntimeException
    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<ApiResponse<Void>> handleRuntimeException(RuntimeException e) {

        ApiResponse<Void> response = ApiResponse.<Void>builder()
                .code(9999)
                .message(e.getMessage())
                .build();

        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
    }

    // Catch all other exceptions
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Void>> handleException(Exception e) {

        ApiResponse<Void> response = ApiResponse.<Void>builder()
                .code(9999)
                .message("Internal server error")
                .build();

        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
    }
}
