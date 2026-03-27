package kaleidoscope.j2ee.examlms.service;

import kaleidoscope.j2ee.examlms.dto.request.QuestionCreateRequest;
import kaleidoscope.j2ee.examlms.dto.response.QuestionResponse;
import kaleidoscope.j2ee.examlms.entity.DifficultyLevel;
import kaleidoscope.j2ee.examlms.entity.QuestionType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface QuestionService {
    
    QuestionResponse createQuestion(QuestionCreateRequest request, String createdBy);
    
    QuestionResponse updateQuestion(String id, QuestionCreateRequest request);
    
    void deleteQuestion(String id);
    
    QuestionResponse getQuestionById(String id);
    
    Page<QuestionResponse> getAllQuestions(Pageable pageable);
    
    List<QuestionResponse> searchByTopics(List<String> topics);
    
    List<QuestionResponse> searchByDifficulty(DifficultyLevel difficulty);
    
    List<QuestionResponse> searchByTopicsAndDifficulty(List<String> topics, DifficultyLevel difficulty);
    
    List<QuestionResponse> searchByType(QuestionType type);
    
    Page<QuestionResponse> getQuestionsByCreator(String createdBy, Pageable pageable);
}
