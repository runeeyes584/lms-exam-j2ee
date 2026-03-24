package com.lms.lms.repository;

import com.lms.lms.entity.InstructorApprovalRequest;
import com.lms.lms.entity.enums.InstructorRequestStatus;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface InstructorApprovalRequestRepository extends MongoRepository<InstructorApprovalRequest, String> {

    boolean existsByUserIdAndStatus(String userId, InstructorRequestStatus status);

    List<InstructorApprovalRequest> findByStatus(InstructorRequestStatus status);

    Optional<InstructorApprovalRequest> findByIdAndStatus(String id, InstructorRequestStatus status);
}