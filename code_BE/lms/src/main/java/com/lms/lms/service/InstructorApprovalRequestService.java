package com.lms.lms.service;

import java.util.List;
import com.lms.lms.entity.enums.InstructorRequestStatus;
import com.lms.lms.dto.request.CreateInstructorRequest;
import com.lms.lms.dto.response.InstructorApprovalRequestResponse;

public interface InstructorApprovalRequestService {
    InstructorApprovalRequestResponse createRequest(String userId, CreateInstructorRequest request);

    List<InstructorApprovalRequestResponse> getRequests(InstructorRequestStatus status);

    InstructorApprovalRequestResponse approveRequest(String requestId, String adminId);

    InstructorApprovalRequestResponse rejectRequest(String requestId, String adminId);
}