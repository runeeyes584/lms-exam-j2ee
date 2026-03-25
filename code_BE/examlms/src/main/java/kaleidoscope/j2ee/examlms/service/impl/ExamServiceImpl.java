package kaleidoscope.j2ee.examlms.service.impl;

import kaleidoscope.j2ee.examlms.dto.request.ExamCreateRequest;
import kaleidoscope.j2ee.examlms.dto.response.ExamResponse;
import kaleidoscope.j2ee.examlms.entity.Exam;
import kaleidoscope.j2ee.examlms.entity.ExamQuestion;
import kaleidoscope.j2ee.examlms.entity.GenerationType;
import kaleidoscope.j2ee.examlms.entity.Question;
import kaleidoscope.j2ee.examlms.repository.ExamRepository;
import kaleidoscope.j2ee.examlms.repository.QuestionRepository;
import kaleidoscope.j2ee.examlms.repository.UserCourseRepository;
import kaleidoscope.j2ee.examlms.service.ExamService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ExamServiceImpl implements ExamService {

    private final ExamRepository examRepository;
    private final QuestionRepository questionRepository;
    private final UserCourseRepository userCourseRepository;

    @Override
    public ExamResponse createExam(ExamCreateRequest request, String createdBy) {
        // Validate questions exist
        validateQuestions(request.getQuestions());
        
        Exam exam = new Exam();
        exam.setTitle(request.getTitle());
        exam.setDescription(request.getDescription());
        exam.setCourseId(request.getCourseId());
        exam.setDuration(request.getDuration());
        exam.setPassingScore(request.getPassingScore());
        exam.setQuestions(request.getQuestions());
        exam.setGenerationType(request.getGenerationType() != null ? 
            request.getGenerationType() : GenerationType.MANUAL);
        exam.setIsPublished(false);
        exam.setCreatedBy(createdBy);
        exam.setCreatedAt(LocalDateTime.now());
        exam.setUpdatedAt(LocalDateTime.now());
        
        // Calculate total points
        Double totalPoints = calculateTotalPoints(request.getQuestions());
        exam.setTotalPoints(totalPoints);
        
        Exam savedExam = examRepository.save(exam);
        log.info("Created exam: {} with {} questions", savedExam.getId(), savedExam.getQuestions().size());
        
        return mapToResponse(savedExam);
    }

    @Override
    public ExamResponse updateExam(String id, ExamCreateRequest request) {
        Exam exam = examRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Exam not found with id: " + id));
        
        // Don't allow updating published exams
        if (exam.getIsPublished()) {
            throw new RuntimeException("Cannot update published exam. Unpublish first.");
        }
        
        // Validate questions exist
        validateQuestions(request.getQuestions());
        
        exam.setTitle(request.getTitle());
        exam.setDescription(request.getDescription());
        exam.setCourseId(request.getCourseId());
        exam.setDuration(request.getDuration());
        exam.setPassingScore(request.getPassingScore());
        exam.setQuestions(request.getQuestions());
        exam.setUpdatedAt(LocalDateTime.now());
        
        // Recalculate total points
        Double totalPoints = calculateTotalPoints(request.getQuestions());
        exam.setTotalPoints(totalPoints);
        
        Exam updatedExam = examRepository.save(exam);
        log.info("Updated exam: {}", updatedExam.getId());
        
        return mapToResponse(updatedExam);
    }

    @Override
    public void deleteExam(String id) {
        Exam exam = examRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Exam not found with id: " + id));
        
        // Don't allow deleting published exams
        if (exam.getIsPublished()) {
            throw new RuntimeException("Cannot delete published exam. Unpublish first.");
        }
        
        examRepository.deleteById(id);
        log.info("Deleted exam: {}", id);
    }

    @Override
    public ExamResponse getExamById(String id) {
        Exam exam = examRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Exam not found with id: " + id));
        return mapToResponse(exam);
    }

    @Override
    public Page<ExamResponse> getAllExams(Pageable pageable) {
        Page<Exam> exams = examRepository.findAll(pageable);
        return exams.map(this::mapToResponse);
    }

    @Override
    public List<ExamResponse> getExamsByCourse(String courseId) {
        List<Exam> exams = examRepository.findByCourseId(courseId);
        return exams.stream()
            .map(this::mapToResponse)
            .collect(Collectors.toList());
    }

    @Override
    public List<ExamResponse> getPublishedExams(String studentId) {
        List<Exam> exams = examRepository.findByIsPublished(true);
        return exams.stream()
            .filter(exam -> {
                if (exam.getCourseId() == null || exam.getCourseId().isBlank()) {
                    return true;
                }
                return userCourseRepository.findByUserIdAndCourseId(studentId, exam.getCourseId()).isPresent();
            })
            .map(this::mapToResponse)
            .collect(Collectors.toList());
    }

    @Override
    public ExamResponse publishExam(String id) {
        Exam exam = examRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Exam not found with id: " + id));
        
        if (exam.getQuestions().isEmpty()) {
            throw new RuntimeException("Cannot publish exam without questions");
        }
        
        exam.setIsPublished(true);
        exam.setUpdatedAt(LocalDateTime.now());
        
        Exam publishedExam = examRepository.save(exam);
        log.info("Published exam: {}", publishedExam.getId());
        
        return mapToResponse(publishedExam);
    }

    @Override
    public ExamResponse unpublishExam(String id) {
        Exam exam = examRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Exam not found with id: " + id));
        
        exam.setIsPublished(false);
        exam.setUpdatedAt(LocalDateTime.now());
        
        Exam unpublishedExam = examRepository.save(exam);
        log.info("Unpublished exam: {}", unpublishedExam.getId());
        
        return mapToResponse(unpublishedExam);
    }

    @Override
    public Page<ExamResponse> getExamsByCreator(String createdBy, Pageable pageable) {
        Page<Exam> exams = examRepository.findByCreatedBy(createdBy, pageable);
        return exams.map(this::mapToResponse);
    }

    private void validateQuestions(List<ExamQuestion> examQuestions) {
        if (examQuestions == null || examQuestions.isEmpty()) {
            throw new RuntimeException("Exam must have at least one question");
        }
        
        for (ExamQuestion eq : examQuestions) {
            if (!questionRepository.existsById(eq.getQuestionId())) {
                throw new RuntimeException("Question not found with id: " + eq.getQuestionId());
            }
        }
    }

    private Double calculateTotalPoints(List<ExamQuestion> examQuestions) {
        double total = 0.0;
        for (ExamQuestion eq : examQuestions) {
            Question question = questionRepository.findById(eq.getQuestionId())
                .orElse(null);
            if (question != null) {
                total += question.getPoints();
            }
        }
        return total;
    }

    private ExamResponse mapToResponse(Exam exam) {
        ExamResponse response = new ExamResponse();
        response.setId(exam.getId());
        response.setTitle(exam.getTitle());
        response.setDescription(exam.getDescription());
        response.setCourseId(exam.getCourseId());
        response.setDuration(exam.getDuration());
        response.setPassingScore(exam.getPassingScore());
        response.setTotalPoints(exam.getTotalPoints());
        response.setQuestions(exam.getQuestions());
        response.setGenerationType(exam.getGenerationType());
        response.setIsPublished(exam.getIsPublished());
        response.setCreatedBy(exam.getCreatedBy());
        response.setCreatedAt(exam.getCreatedAt());
        response.setUpdatedAt(exam.getUpdatedAt());
        return response;
    }
}
