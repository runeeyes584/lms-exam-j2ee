package kaleidoscope.j2ee.examlms.dto.request;

import jakarta.validation.constraints.NotNull;

public record UpdateUserStatusRequest(
        @NotNull Boolean isActive) {
}
