package kaleidoscope.j2ee.examlms.service;

import kaleidoscope.j2ee.examlms.dto.request.ExamCreateRequest;
import kaleidoscope.j2ee.examlms.dto.response.ExamResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface ExamService {
    
    ExamResponse createExam(ExamCreateRequest request, String createdBy);
    
    ExamResponse updateExam(String id, ExamCreateRequest request);
    
    void deleteExam(String id);
    
    ExamResponse getExamById(String id);
    
    Page<ExamResponse> getAllExams(Pageable pageable);
    
    List<ExamResponse> getExamsByCourse(String courseId);
    
    List<ExamResponse> getPublishedExams(String studentId);
    
    ExamResponse publishExam(String id);
    
    ExamResponse unpublishExam(String id);

    ExamResponse updateReviewVisibility(String id, Boolean allowResultReview, String userId);
    
    Page<ExamResponse> getExamsByCreator(String createdBy, Pageable pageable);
}
