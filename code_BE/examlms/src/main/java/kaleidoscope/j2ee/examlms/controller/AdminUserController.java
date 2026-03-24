package kaleidoscope.j2ee.examlms.controller;

import java.time.Instant;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;
import kaleidoscope.j2ee.examlms.dto.request.UpdateUserRoleRequest;
import kaleidoscope.j2ee.examlms.dto.request.UpdateUserStatusRequest;
import kaleidoscope.j2ee.examlms.dto.response.AdminUserResponse;
import kaleidoscope.j2ee.examlms.dto.response.ApiResponse;
import kaleidoscope.j2ee.examlms.entity.User;
import kaleidoscope.j2ee.examlms.repository.UserRepository;
import kaleidoscope.j2ee.examlms.utils.ApiResponseUtil;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/admin/users")
@RequiredArgsConstructor
public class AdminUserController {

    private final UserRepository userRepository;

    @GetMapping
    public ApiResponse<Page<AdminUserResponse>> getAllUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String role,
            @RequestParam(required = false) Boolean isActive) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());

        List<AdminUserResponse> filteredUsers = userRepository.findAll(Sort.by(Sort.Direction.DESC, "createdAt"))
                .stream()
                .filter(user -> role == null || user.getRole().name().equalsIgnoreCase(role))
                .filter(user -> isActive == null || isActive.equals(normalizeActive(user)))
                .map(this::toResponse)
                .toList();

        int start = Math.min((int) pageable.getOffset(), filteredUsers.size());
        int end = Math.min(start + pageable.getPageSize(), filteredUsers.size());

        return ApiResponseUtil.success(new PageImpl<>(filteredUsers.subList(start, end), pageable, filteredUsers.size()));
    }

    @PatchMapping("/{id}/status")
    public ApiResponse<AdminUserResponse> updateUserStatus(
            @PathVariable String id,
            @Valid @RequestBody UpdateUserStatusRequest request) {
        User user = userRepository.findById(id).orElseThrow();
        user.setIsActive(request.isActive());
        user.setUpdatedAt(Instant.now());
        return ApiResponseUtil.success(toResponse(userRepository.save(user)));
    }

    @PatchMapping("/{id}/role")
    public ApiResponse<AdminUserResponse> updateUserRole(
            @PathVariable String id,
            @Valid @RequestBody UpdateUserRoleRequest request) {
        User user = userRepository.findById(id).orElseThrow();
        user.setRole(request.role());
        user.setUpdatedAt(Instant.now());
        return ApiResponseUtil.success(toResponse(userRepository.save(user)));
    }

    private AdminUserResponse toResponse(User user) {
        return AdminUserResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .role(user.getRole())
                .isActive(normalizeActive(user))
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .build();
    }

    private boolean normalizeActive(User user) {
        return user.getIsActive() == null || user.getIsActive();
    }
}
