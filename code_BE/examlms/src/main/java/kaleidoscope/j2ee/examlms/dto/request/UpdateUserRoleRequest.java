package kaleidoscope.j2ee.examlms.dto.request;

import jakarta.validation.constraints.NotNull;
import kaleidoscope.j2ee.examlms.entity.enums.Role;

public record UpdateUserRoleRequest(
        @NotNull Role role) {
}
