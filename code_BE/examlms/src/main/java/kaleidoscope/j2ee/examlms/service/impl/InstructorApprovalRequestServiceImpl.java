package kaleidoscope.j2ee.examlms.service.impl;

import java.time.Instant;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import kaleidoscope.j2ee.examlms.dto.request.CreateInstructorRequest;
import kaleidoscope.j2ee.examlms.dto.response.InstructorApprovalRequestResponse;
import kaleidoscope.j2ee.examlms.dto.response.InstructorRequestUserResponse;
import kaleidoscope.j2ee.examlms.entity.InstructorApprovalRequest;
import kaleidoscope.j2ee.examlms.entity.User;
import kaleidoscope.j2ee.examlms.entity.enums.InstructorRequestStatus;
import kaleidoscope.j2ee.examlms.entity.enums.Role;
import kaleidoscope.j2ee.examlms.exception.AppException;
import kaleidoscope.j2ee.examlms.repository.InstructorApprovalRequestRepository;
import kaleidoscope.j2ee.examlms.repository.UserRepository;
import kaleidoscope.j2ee.examlms.service.InstructorApprovalRequestService;
import kaleidoscope.j2ee.examlms.utils.ResponseCode;

@Service
public class InstructorApprovalRequestServiceImpl implements InstructorApprovalRequestService {
    private static final Set<String> ALLOWED_CV_EXTENSIONS = Set.of("pdf", "doc", "docx");
    private static final long MAX_CV_FILE_SIZE = 5 * 1024 * 1024;

    private final InstructorApprovalRequestRepository instructorApprovalRequestRepository;
    private final UserRepository userRepository;
    private final String uploadDir;

    public InstructorApprovalRequestServiceImpl(
            InstructorApprovalRequestRepository instructorApprovalRequestRepository,
            UserRepository userRepository,
            @Value("${upload.dir}") String uploadDir) {
        this.instructorApprovalRequestRepository = instructorApprovalRequestRepository;
        this.userRepository = userRepository;
        this.uploadDir = uploadDir;
    }

    @Override
    public InstructorApprovalRequestResponse createRequest(String userId, CreateInstructorRequest request, MultipartFile cvFile) {
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

        String note = request != null ? request.note() : null;
        if (note != null && note.length() > 500) {
            throw new AppException(ResponseCode.VALIDATION_ERROR, "Note must be at most 500 characters");
        }

        String cvFileUrl = null;
        String cvOriginalFileName = null;
        if (cvFile != null && !cvFile.isEmpty()) {
            validateCvFile(cvFile);
            String storedCvFileName = storeCvFile(cvFile);
            cvFileUrl = "/uploads/instructor-cv/" + storedCvFileName;
            cvOriginalFileName = cvFile.getOriginalFilename();
        }

        InstructorApprovalRequest newRequest = InstructorApprovalRequest.builder()
                .userId(userId)
                .status(InstructorRequestStatus.PENDING)
                .note(note)
                .cvFileUrl(cvFileUrl)
                .cvOriginalFileName(cvOriginalFileName)
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
        User user = userRepository.findById(request.getUserId()).orElse(null);

        return InstructorApprovalRequestResponse.builder()
                .id(request.getId())
                .userId(request.getUserId())
                .user(user == null ? null : InstructorRequestUserResponse.builder()
                        .id(user.getId())
                        .email(user.getEmail())
                        .fullName(user.getFullName())
                        .role(user.getRole())
                        .isActive(user.getIsActive() == null ? Boolean.TRUE : user.getIsActive())
                        .build())
                .status(request.getStatus())
                .note(request.getNote())
                .cvFileUrl(request.getCvFileUrl())
                .cvOriginalFileName(request.getCvOriginalFileName())
                .createdAt(request.getCreatedAt())
                .reviewedAt(request.getReviewedAt())
                .reviewedBy(request.getReviewedBy())
                .build();
    }

    private void validateCvFile(MultipartFile cvFile) {
        if (cvFile.getSize() > MAX_CV_FILE_SIZE) {
            throw new AppException(ResponseCode.VALIDATION_ERROR, "CV file size must be <= 5MB");
        }

        String extension = extractFileExtension(cvFile.getOriginalFilename());
        if (!ALLOWED_CV_EXTENSIONS.contains(extension)) {
            throw new AppException(ResponseCode.VALIDATION_ERROR, "Only PDF, DOC, DOCX files are allowed for CV");
        }
    }

    private String storeCvFile(MultipartFile cvFile) {
        try {
            java.nio.file.Path cvUploadDir = java.nio.file.Paths.get(uploadDir, "instructor-cv").toAbsolutePath().normalize();
            java.nio.file.Files.createDirectories(cvUploadDir);

            String extension = extractFileExtension(cvFile.getOriginalFilename());
            String storedFileName = java.util.UUID.randomUUID() + "." + extension;
            java.nio.file.Path targetPath = cvUploadDir.resolve(storedFileName);

            java.nio.file.Files.copy(cvFile.getInputStream(), targetPath, java.nio.file.StandardCopyOption.REPLACE_EXISTING);
            return storedFileName;
        } catch (java.io.IOException ex) {
            throw new AppException(ResponseCode.ERROR, "Failed to store CV file");
        }
    }

    private String extractFileExtension(String fileName) {
        if (fileName == null || !fileName.contains(".")) {
            return "";
        }
        return fileName.substring(fileName.lastIndexOf('.') + 1).toLowerCase(Locale.ROOT);
    }
}
