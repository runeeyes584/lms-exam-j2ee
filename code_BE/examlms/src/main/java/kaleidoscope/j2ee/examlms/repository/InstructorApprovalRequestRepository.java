package kaleidoscope.j2ee.examlms.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;

import kaleidoscope.j2ee.examlms.entity.InstructorApprovalRequest;
import kaleidoscope.j2ee.examlms.entity.enums.InstructorRequestStatus;

public interface InstructorApprovalRequestRepository extends MongoRepository<InstructorApprovalRequest, String> {

    boolean existsByUserIdAndStatus(String userId, InstructorRequestStatus status);

    List<InstructorApprovalRequest> findByStatus(InstructorRequestStatus status);

    Optional<InstructorApprovalRequest> findByIdAndStatus(String id, InstructorRequestStatus status);
}