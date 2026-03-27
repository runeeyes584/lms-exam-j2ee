package kaleidoscope.j2ee.examlms.service;

import kaleidoscope.j2ee.examlms.dto.request.ExamSubmitRequest;
import kaleidoscope.j2ee.examlms.dto.response.ExamAttemptResponse;
import kaleidoscope.j2ee.examlms.entity.StudentAnswer;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface ExamAttemptService {
    
    /**
     * Start a new exam attempt
     */
    ExamAttemptResponse startExam(String examId, String studentId);
    
    /**
     * Save progress (auto-save answers)
     */
    ExamAttemptResponse saveProgress(String attemptId, List<StudentAnswer> answers);
    
    /**
     * Submit exam and trigger auto-grading
     */
    ExamAttemptResponse submitExam(String attemptId, ExamSubmitRequest request);
    
    /**
     * Get attempt by ID
     */
    ExamAttemptResponse getAttemptById(String attemptId);
    
    /**
     * Get student's attempts (their own history)
     */
    Page<ExamAttemptResponse> getMyAttempts(String studentId, Pageable pageable);
    
    /**
     * Get all attempts for an exam (instructor view)
     */
    Page<ExamAttemptResponse> getAttemptsByExam(String examId, String instructorId, Pageable pageable);
    
    /**
     * Get attempt details for review (includes correct answers)
     */
    ExamAttemptResponse getAttemptForReview(String attemptId, String studentId);
}
