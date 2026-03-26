package kaleidoscope.j2ee.examlms.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateReviewVisibilityRequest {
    @NotNull(message = "allowResultReview is required")
    private Boolean allowResultReview;
}
