package com.lms.lms.controller;

import com.lms.lms.dto.request.CreateInstructorRequest;
import com.lms.lms.dto.response.ApiResponse;
import com.lms.lms.dto.response.InstructorApprovalRequestResponse;
import com.lms.lms.service.InstructorApprovalRequestService;
import com.lms.lms.utils.ApiResponseUtil;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import com.lms.lms.entity.enums.InstructorRequestStatus;

import java.util.List;

@RestController
@RequestMapping("/api/instructor-requests")
@RequiredArgsConstructor
public class InstructorApprovalRequestController {

    private final InstructorApprovalRequestService instructorApprovalRequestService;

    @PostMapping
    public ApiResponse<InstructorApprovalRequestResponse> createRequest(
            Authentication authentication,
            @Valid @RequestBody(required = false) CreateInstructorRequest request) {
        String userId = authentication.getName();
        return ApiResponseUtil.success(
                "Instructor request created successfully",
                instructorApprovalRequestService.createRequest(userId, request));
    }

    @GetMapping
    public ApiResponse<List<InstructorApprovalRequestResponse>> getRequests(
            @RequestParam(required = false) InstructorRequestStatus status) {
        return ApiResponseUtil.success(
                instructorApprovalRequestService.getRequests(status));
    }

    @PostMapping("/{id}/approve")
    public ApiResponse<InstructorApprovalRequestResponse> approveRequest(
            Authentication authentication,
            @PathVariable String id) {
        String adminId = authentication.getName();
        return ApiResponseUtil.success(
                "Request approved successfully",
                instructorApprovalRequestService.approveRequest(id, adminId));
    }

    @PostMapping("/{id}/reject")
    public ApiResponse<InstructorApprovalRequestResponse> rejectRequest(
            Authentication authentication,
            @PathVariable String id) {
        String adminId = authentication.getName();
        return ApiResponseUtil.success(
                "Request rejected successfully",
                instructorApprovalRequestService.rejectRequest(id, adminId));
    }
}