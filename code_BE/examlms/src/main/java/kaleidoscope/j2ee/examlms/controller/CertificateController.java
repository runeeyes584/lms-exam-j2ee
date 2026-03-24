package kaleidoscope.j2ee.examlms.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import kaleidoscope.j2ee.examlms.dto.response.ApiResponse;
import kaleidoscope.j2ee.examlms.service.CertificateService;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/certificates")
@RequiredArgsConstructor
public class CertificateController {

    private final CertificateService certificateService;

    @GetMapping("/{userId}/{courseId}")
    public ApiResponse<String> generateCertificate(
            @PathVariable String userId,
            @PathVariable String courseId) {
        String filePath = certificateService.generateCertificate(userId, courseId);

        return ApiResponse.<String>builder()
                .code(1000)
                .message("Certificate generated")
                .result(filePath)
                .build();
    }
}