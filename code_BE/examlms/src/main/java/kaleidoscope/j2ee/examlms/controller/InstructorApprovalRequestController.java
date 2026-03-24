package kaleidoscope.j2ee.examlms.controller;

import java.util.List;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;
import kaleidoscope.j2ee.examlms.dto.request.CreateInstructorRequest;
import kaleidoscope.j2ee.examlms.dto.response.ApiResponse;
import kaleidoscope.j2ee.examlms.dto.response.InstructorApprovalRequestResponse;
import kaleidoscope.j2ee.examlms.entity.enums.InstructorRequestStatus;
import kaleidoscope.j2ee.examlms.service.InstructorApprovalRequestService;
import kaleidoscope.j2ee.examlms.utils.ApiResponseUtil;
import lombok.RequiredArgsConstructor;

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