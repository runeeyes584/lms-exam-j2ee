package com.example.be_lms.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.be_lms.dto.response.ApiResponse;
import com.example.be_lms.service.CertificateService;

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