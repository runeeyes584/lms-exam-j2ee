package com.lms.lms.service.impl;

import com.lms.lms.dto.request.CreateInstructorRequest;
import com.lms.lms.dto.response.InstructorApprovalRequestResponse;
import com.lms.lms.entity.InstructorApprovalRequest;
import com.lms.lms.entity.User;
import com.lms.lms.entity.enums.InstructorRequestStatus;
import com.lms.lms.entity.enums.Role;
import com.lms.lms.exception.AppException;
import com.lms.lms.repository.InstructorApprovalRequestRepository;
import com.lms.lms.repository.UserRepository;
import com.lms.lms.service.InstructorApprovalRequestService;
import com.lms.lms.utils.ResponseCode;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class InstructorApprovalRequestServiceImpl implements InstructorApprovalRequestService {

    private final InstructorApprovalRequestRepository instructorApprovalRequestRepository;
    private final UserRepository userRepository;

    @Override
    public InstructorApprovalRequestResponse createRequest(String userId, CreateInstructorRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ResponseCode.NOT_FOUND, "User not found"));

        if (user.getRole() != Role.STUDENT) {
            throw new AppException(ResponseCode.FORBIDDEN, "Only students can send instructor requests");
        }

        boolean hasPendingRequest = instructorApprovalRequestRepository
                .existsByUserIdAndStatus(userId, InstructorRequestStatus.PENDING);

        if (hasPendingRequest) {
            throw new AppException(ResponseCode.VALIDATION_ERROR, "You already have a pending instructor request");
        }

        InstructorApprovalRequest newRequest = InstructorApprovalRequest.builder()
                .userId(userId)
                .status(InstructorRequestStatus.PENDING)
                .note(request != null ? request.note() : null)
                .createdAt(Instant.now())
                .reviewedAt(null)
                .reviewedBy(null)
                .build();

        InstructorApprovalRequest savedRequest = instructorApprovalRequestRepository.save(newRequest);

        return mapToResponse(savedRequest);
    }

    @Override
    public List<InstructorApprovalRequestResponse> getRequests(InstructorRequestStatus status) {
        List<InstructorApprovalRequest> requests;

        if (status != null) {
            requests = instructorApprovalRequestRepository.findByStatus(status);
        } else {
            requests = instructorApprovalRequestRepository.findAll();
        }

        return requests.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public InstructorApprovalRequestResponse approveRequest(String requestId, String adminId) {
        InstructorApprovalRequest request = instructorApprovalRequestRepository
                .findByIdAndStatus(requestId, InstructorRequestStatus.PENDING)
                .orElseThrow(() -> new AppException(ResponseCode.NOT_FOUND, "Pending request not found"));

        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new AppException(ResponseCode.NOT_FOUND, "User not found"));

        user.setRole(Role.INSTRUCTOR);
        userRepository.save(user);

        request.setStatus(InstructorRequestStatus.APPROVED);
        request.setReviewedAt(Instant.now());
        request.setReviewedBy(adminId);

        return mapToResponse(instructorApprovalRequestRepository.save(request));
    }

    @Override
    public InstructorApprovalRequestResponse rejectRequest(String requestId, String adminId) {
        InstructorApprovalRequest request = instructorApprovalRequestRepository
                .findByIdAndStatus(requestId, InstructorRequestStatus.PENDING)
                .orElseThrow(() -> new AppException(ResponseCode.NOT_FOUND, "Pending request not found"));

        request.setStatus(InstructorRequestStatus.REJECTED);
        request.setReviewedAt(Instant.now());
        request.setReviewedBy(adminId);

        return mapToResponse(instructorApprovalRequestRepository.save(request));
    }

    private InstructorApprovalRequestResponse mapToResponse(InstructorApprovalRequest request) {
        return InstructorApprovalRequestResponse.builder()
                .id(request.getId())
                .userId(request.getUserId())
                .status(request.getStatus())
                .note(request.getNote())
                .createdAt(request.getCreatedAt())
                .reviewedAt(request.getReviewedAt())
                .reviewedBy(request.getReviewedBy())
                .build();
    }
}