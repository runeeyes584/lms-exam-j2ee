package kaleidoscope.j2ee.examlms.dto.response;

import java.util.ArrayList;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExcelImportResponse {

    private Integer totalRows;
    private Integer successCount;
    private Integer failureCount;
    private List<String> errors;
    private List<String> createdQuestionIds;

    public ExcelImportResponse(Integer totalRows, Integer successCount, Integer failureCount) {
        this.totalRows = totalRows;
        this.successCount = successCount;
        this.failureCount = failureCount;
        this.errors = new ArrayList<>();
        this.createdQuestionIds = new ArrayList<>();
    }

    public void addError(String error) {
        if (this.errors == null) {
            this.errors = new ArrayList<>();
        }
        this.errors.add(error);
    }

    public void addCreatedQuestionId(String questionId) {
        if (this.createdQuestionIds == null) {
            this.createdQuestionIds = new ArrayList<>();
        }
        this.createdQuestionIds.add(questionId);
    }
}
