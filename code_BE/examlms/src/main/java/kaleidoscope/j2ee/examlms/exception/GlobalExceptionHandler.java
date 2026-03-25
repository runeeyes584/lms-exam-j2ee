package kaleidoscope.j2ee.examlms.exception;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.HttpMediaTypeNotSupportedException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.multipart.MaxUploadSizeExceededException;
import org.springframework.web.multipart.MultipartException;

import kaleidoscope.j2ee.examlms.dto.response.ApiResponse;

@RestControllerAdvice
public class GlobalExceptionHandler {
    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

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
        log.error("Runtime exception", e);

        ApiResponse<Void> response = ApiResponse.<Void>builder()
                .code(9999)
                .message(e.getMessage())
                .build();

        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
    }

    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public ResponseEntity<ApiResponse<Void>> handleMaxUploadSizeExceededException(MaxUploadSizeExceededException e) {
        log.error("Upload file too large", e);

        ApiResponse<Void> response = ApiResponse.<Void>builder()
                .code(4000)
                .message("File upload exceeded max size (10MB)")
                .build();

        return ResponseEntity.status(HttpStatus.PAYLOAD_TOO_LARGE).body(response);
    }

    @ExceptionHandler(MultipartException.class)
    public ResponseEntity<ApiResponse<Void>> handleMultipartException(MultipartException e) {
        log.error("Multipart exception", e);

        ApiResponse<Void> response = ApiResponse.<Void>builder()
                .code(4000)
                .message("Invalid multipart request: " + (e.getMessage() == null ? "unknown error" : e.getMessage()))
                .build();

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }

    @ExceptionHandler(HttpMediaTypeNotSupportedException.class)
    public ResponseEntity<ApiResponse<Void>> handleHttpMediaTypeNotSupportedException(HttpMediaTypeNotSupportedException e) {
        log.error("Unsupported media type", e);

        ApiResponse<Void> response = ApiResponse.<Void>builder()
                .code(4000)
                .message("Content-Type not supported. Use multipart/form-data for file upload.")
                .build();

        return ResponseEntity.status(HttpStatus.UNSUPPORTED_MEDIA_TYPE).body(response);
    }

    // Catch all other exceptions
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Void>> handleException(Exception e) {
        log.error("Unhandled exception", e);

        String message = (e.getMessage() == null || e.getMessage().isBlank())
                ? "Internal server error"
                : e.getMessage();

        ApiResponse<Void> response = ApiResponse.<Void>builder()
                .code(9999)
                .message(message)
                .build();

        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
    }
}
