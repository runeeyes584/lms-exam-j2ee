package kaleidoscope.j2ee.examlms.controller;

import java.util.List;

import org.springframework.security.core.Authentication;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

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

        @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE)
        public ApiResponse<InstructorApprovalRequestResponse> createRequest(
                        Authentication authentication,
                        @Valid @RequestBody(required = false) CreateInstructorRequest request) {
                String userId = authentication.getName();
                return ApiResponseUtil.success(
                                "Instructor request created successfully",
                                instructorApprovalRequestService.createRequest(userId, request, null));
        }

        @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
        public ApiResponse<InstructorApprovalRequestResponse> createRequestWithCv(
                        Authentication authentication,
                        @RequestParam(value = "note", required = false) String note,
                        @RequestParam(value = "file", required = false) MultipartFile file) {
                String userId = authentication.getName();
                CreateInstructorRequest request = new CreateInstructorRequest(note);
                return ApiResponseUtil.success(
                                "Instructor request created successfully",
                                instructorApprovalRequestService.createRequest(userId, request, file));
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
