package kaleidoscope.j2ee.examlms.controller;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;

import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import kaleidoscope.j2ee.examlms.dto.response.ApiResponse;
import kaleidoscope.j2ee.examlms.dto.response.CertificateResponse;
import kaleidoscope.j2ee.examlms.service.CertificateService;
import kaleidoscope.j2ee.examlms.utils.ApiResponseUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;

@RestController
@RequestMapping("/api/certificates")
@RequiredArgsConstructor
public class CertificateController {

    private final CertificateService certificateService;

    @GetMapping("/my")
    public ApiResponse<List<CertificateResponse>> getMyCertificates(Authentication authentication) {
        return ApiResponseUtil.success(certificateService.getMyCertificates(authentication.getName()));
    }

    @GetMapping("/{userId}/{courseId}")
    public ApiResponse<String> generateCertificate(
            @PathVariable String userId,
            @PathVariable String courseId) {
        return ApiResponseUtil.success("Certificate generated", certificateService.generateCertificate(userId, courseId));
    }

    @GetMapping("/{courseId}/download")
    public ResponseEntity<Resource> downloadCertificate(
            Authentication authentication,
            @PathVariable String courseId) throws IOException {
        String filePath = certificateService.getCertificateFile(authentication.getName(), courseId);
        Path path = Path.of(filePath);
        ByteArrayResource resource = new ByteArrayResource(Files.readAllBytes(path));

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + path.getFileName() + "\"")
                .contentType(MediaType.APPLICATION_PDF)
                .contentLength(Files.size(path))
                .body(resource);
    }
}
