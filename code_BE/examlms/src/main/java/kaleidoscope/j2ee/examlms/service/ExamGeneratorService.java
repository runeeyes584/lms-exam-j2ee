package kaleidoscope.j2ee.examlms.service;

import kaleidoscope.j2ee.examlms.dto.request.ExamGenerateRequest;
import kaleidoscope.j2ee.examlms.dto.response.ExamResponse;

public interface ExamGeneratorService {
    
    /**
     * Auto-generate exam based on difficulty distribution and topics
     * 
     * @param request Generation parameters (title, topics, difficulty matrix)
     * @param createdBy User creating the exam
     * @return Generated exam
     */
    ExamResponse generateExam(ExamGenerateRequest request, String createdBy);
}
