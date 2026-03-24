package kaleidoscope.j2ee.examlms.service;

import java.util.List;

import kaleidoscope.j2ee.examlms.dto.request.CreateInstructorRequest;
import kaleidoscope.j2ee.examlms.dto.response.InstructorApprovalRequestResponse;
import kaleidoscope.j2ee.examlms.entity.enums.InstructorRequestStatus;

public interface InstructorApprovalRequestService {
    InstructorApprovalRequestResponse createRequest(String userId, CreateInstructorRequest request);

    List<InstructorApprovalRequestResponse> getRequests(InstructorRequestStatus status);

    InstructorApprovalRequestResponse approveRequest(String requestId, String adminId);

    InstructorApprovalRequestResponse rejectRequest(String requestId, String adminId);
}