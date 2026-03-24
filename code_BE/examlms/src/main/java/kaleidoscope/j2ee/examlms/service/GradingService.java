package kaleidoscope.j2ee.examlms.service;

import kaleidoscope.j2ee.examlms.dto.request.ManualGradeRequest;
import kaleidoscope.j2ee.examlms.dto.request.QuestionGradeRequest;
import kaleidoscope.j2ee.examlms.dto.response.ExamAttemptResponse;
import kaleidoscope.j2ee.examlms.dto.response.GradingDetailResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface GradingService {
    
    /**
     * Get attempts that need manual grading
     */
    Page<ExamAttemptResponse> getAttemptsNeedingGrading(Pageable pageable);
    
    /**
     * Get attempts for a specific exam that need grading
     */
    Page<ExamAttemptResponse> getAttemptsNeedingGradingByExam(String examId, Pageable pageable);
    
    /**
     * Get detailed grading information for an attempt
     */
    GradingDetailResponse getGradingDetails(String attemptId);
    
    /**
     * Grade a single question manually
     */
    GradingDetailResponse gradeQuestion(String attemptId, QuestionGradeRequest request, String gradedBy);
    
    /**
     * Grade multiple questions at once
     */
    ExamAttemptResponse gradeAttempt(ManualGradeRequest request, String gradedBy);
    
    /**
     * Finalize grading (mark as complete)
     */
    ExamAttemptResponse finalizeGrading(String attemptId, String gradedBy);
}
