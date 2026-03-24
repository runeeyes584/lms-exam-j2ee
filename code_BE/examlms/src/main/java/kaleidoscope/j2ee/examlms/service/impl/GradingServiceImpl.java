package kaleidoscope.j2ee.examlms.service.impl;

import kaleidoscope.j2ee.examlms.dto.request.ManualGradeRequest;
import kaleidoscope.j2ee.examlms.dto.request.QuestionGradeRequest;
import kaleidoscope.j2ee.examlms.dto.response.ExamAttemptResponse;
import kaleidoscope.j2ee.examlms.dto.response.GradingDetailResponse;
import kaleidoscope.j2ee.examlms.entity.*;
import kaleidoscope.j2ee.examlms.repository.ExamAttemptRepository;
import kaleidoscope.j2ee.examlms.repository.ExamRepository;
import kaleidoscope.j2ee.examlms.repository.QuestionRepository;
import kaleidoscope.j2ee.examlms.service.GradingService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class GradingServiceImpl implements GradingService {

    private final ExamAttemptRepository attemptRepository;
    private final ExamRepository examRepository;
    private final QuestionRepository questionRepository;

    @Override
    public Page<ExamAttemptResponse> getAttemptsNeedingGrading(Pageable pageable) {
        Page<ExamAttempt> attempts = attemptRepository.findAll(pageable);
        
        // Filter for submitted status (waiting for manual grading review)
        return (Page<ExamAttemptResponse>) attempts
            .filter(a -> a.getStatus() == AttemptStatus.SUBMITTED)
            .map(this::mapToResponse);
    }

    @Override
    public Page<ExamAttemptResponse> getAttemptsNeedingGradingByExam(String examId, Pageable pageable) {
        Page<ExamAttempt> attempts = attemptRepository.findByExamId(examId, pageable);
        
        return (Page<ExamAttemptResponse>) attempts
            .filter(a -> a.getStatus() == AttemptStatus.SUBMITTED)
            .map(this::mapToResponse);
    }

    @Override
    public GradingDetailResponse getGradingDetails(String attemptId) {
        ExamAttempt attempt = attemptRepository.findById(attemptId)
            .orElseThrow(() -> new RuntimeException("Attempt not found with id: " + attemptId));
        
        Exam exam = examRepository.findById(attempt.getExamId())
            .orElseThrow(() -> new RuntimeException("Exam not found"));
        
        GradingDetailResponse response = GradingDetailResponse.builder()
            .attemptId(attempt.getId())
            .examId(attempt.getExamId())
            .studentId(attempt.getStudentId())
            .autoGradedScore(attempt.getAutoGradedScore())
            .manualGradedScore(attempt.getManualGradedScore())
            .totalScore(attempt.getTotalScore())
            .totalQuestions(attempt.getAnswers().size())
            .build();
        
        // Build question grade details
        Map<String, GradingDetailResponse.QuestionGradeDetail> questionGrades = new HashMap<>();
        int gradedCount = 0;
        int pendingCount = 0;
        
        for (StudentAnswer answer : attempt.getAnswers()) {
            Question question = questionRepository.findById(answer.getQuestionId())
                .orElse(null);
            
            if (question == null) {
                continue;
            }
            
            GradingDetailResponse.QuestionGradeDetail detail = buildQuestionGradeDetail(
                question, answer, attempt
            );
            
            questionGrades.put(answer.getQuestionId(), detail);
            
            if (detail.getIsAutoGraded() && !detail.getNeedsManualReview()) {
                gradedCount++;
            } else {
                pendingCount++;
            }
        }
        
        response.setQuestionGrades(questionGrades);
        response.setGradedQuestions(gradedCount);
        response.setPendingQuestions(pendingCount);
        
        return response;
    }

    @Override
    public GradingDetailResponse gradeQuestion(String attemptId, QuestionGradeRequest request, String gradedBy) {
        ExamAttempt attempt = attemptRepository.findById(attemptId)
            .orElseThrow(() -> new RuntimeException("Attempt not found"));
        
        Question question = questionRepository.findById(request.getQuestionId())
            .orElseThrow(() -> new RuntimeException("Question not found"));
        
        // Validate score doesn't exceed max points
        if (request.getScore() > question.getPoints()) {
            throw new RuntimeException("Score cannot exceed maximum points: " + question.getPoints());
        }
        
        // Update manual graded score
        double currentManualScore = attempt.getManualGradedScore() != null ? 
            attempt.getManualGradedScore() : 0.0;
        
        // Find existing score for this question and replace it
        // For simplicity, we'll recalculate total from auto + this manual score
        currentManualScore += request.getScore();
        
        attempt.setManualGradedScore(currentManualScore);
        attempt.setGradedBy(gradedBy);
        attempt.setGradedAt(LocalDateTime.now());
        
        attemptRepository.save(attempt);
        
        log.info("Manually graded question {} in attempt {}: score={}", 
            request.getQuestionId(), attemptId, request.getScore());
        
        return getGradingDetails(attemptId);
    }

    @Override
    public ExamAttemptResponse gradeAttempt(ManualGradeRequest request, String gradedBy) {
        ExamAttempt attempt = attemptRepository.findById(request.getAttemptId())
            .orElseThrow(() -> new RuntimeException("Attempt not found"));
        
        if (attempt.getStatus() == AttemptStatus.IN_PROGRESS) {
            throw new RuntimeException("Cannot grade. Exam is still in progress.");
        }
        
        // Calculate manual graded score
        double manualScore = 0.0;
        
        for (Map.Entry<String, Double> entry : request.getQuestionScores().entrySet()) {
            String questionId = entry.getKey();
            Double score = entry.getValue();
            
            // Validate question exists and score is valid
            Question question = questionRepository.findById(questionId)
                .orElseThrow(() -> new RuntimeException("Question not found: " + questionId));
            
            if (score > question.getPoints()) {
                throw new RuntimeException("Score for question " + questionId + 
                    " cannot exceed max points: " + question.getPoints());
            }
            
            manualScore += score;
        }
        
        attempt.setManualGradedScore(manualScore);
        
        // Total score = auto-graded + manual-graded
        double autoScore = attempt.getAutoGradedScore() != null ? attempt.getAutoGradedScore() : 0.0;
        attempt.setTotalScore(autoScore + manualScore);
        
        attempt.setStatus(AttemptStatus.GRADED);
        attempt.setGradedBy(gradedBy);
        attempt.setGradedAt(LocalDateTime.now());
        
        ExamAttempt savedAttempt = attemptRepository.save(attempt);
        
        log.info("Graded attempt {}: auto={}, manual={}, total={}", 
            attempt.getId(), autoScore, manualScore, attempt.getTotalScore());
        
        return mapToResponse(savedAttempt);
    }

    @Override
    public ExamAttemptResponse finalizeGrading(String attemptId, String gradedBy) {
        ExamAttempt attempt = attemptRepository.findById(attemptId)
            .orElseThrow(() -> new RuntimeException("Attempt not found"));
        
        if (attempt.getStatus() != AttemptStatus.SUBMITTED) {
            throw new RuntimeException("Attempt is not in submitted status");
        }
        
        // Calculate total score
        double autoScore = attempt.getAutoGradedScore() != null ? attempt.getAutoGradedScore() : 0.0;
        double manualScore = attempt.getManualGradedScore() != null ? attempt.getManualGradedScore() : 0.0;
        
        attempt.setTotalScore(autoScore + manualScore);
        attempt.setStatus(AttemptStatus.GRADED);
        attempt.setGradedBy(gradedBy);
        attempt.setGradedAt(LocalDateTime.now());
        
        ExamAttempt savedAttempt = attemptRepository.save(attempt);
        
        log.info("Finalized grading for attempt {}: total score = {}", attemptId, attempt.getTotalScore());
        
        return mapToResponse(savedAttempt);
    }

    private GradingDetailResponse.QuestionGradeDetail buildQuestionGradeDetail(
            Question question, StudentAnswer answer, ExamAttempt attempt) {
        
        String studentAnswerText = formatStudentAnswer(question, answer);
        String correctAnswerText = formatCorrectAnswer(question);
        
        // For now, all questions are auto-graded
        // In future, essay questions would need manual review
        boolean isAutoGraded = true;
        boolean needsManualReview = false;
        
        // Calculate earned points (simplified - would need more complex logic for partial credit)
        double earnedPoints = calculateEarnedPoints(question, answer);
        
        return GradingDetailResponse.QuestionGradeDetail.builder()
            .questionId(question.getId())
            .questionContent(question.getContent())
            .studentAnswer(studentAnswerText)
            .correctAnswer(correctAnswerText)
            .maxPoints(question.getPoints())
            .earnedPoints(earnedPoints)
            .isAutoGraded(isAutoGraded)
            .needsManualReview(needsManualReview)
            .accepted(earnedPoints > 0)
            .build();
    }

    private String formatStudentAnswer(Question question, StudentAnswer answer) {
        switch (question.getType()) {
            case MULTIPLE_CHOICE:
            case TRUE_FALSE:
                if (answer.getSelectedOptions() == null || answer.getSelectedOptions().isEmpty()) {
                    return "[No answer]";
                }
                return answer.getSelectedOptions().stream()
                    .map(idx -> {
                        if (idx < question.getOptions().size()) {
                            return question.getOptions().get(idx).getText();
                        }
                        return "Option " + idx;
                    })
                    .collect(Collectors.joining(", "));
            
            case FILL_IN:
                return answer.getFillAnswer() != null ? answer.getFillAnswer() : "[No answer]";
            
            default:
                return "[Unknown]";
        }
    }

    private String formatCorrectAnswer(Question question) {
        switch (question.getType()) {
            case MULTIPLE_CHOICE:
            case TRUE_FALSE:
                return question.getOptions().stream()
                    .filter(opt -> Boolean.TRUE.equals(opt.getIsCorrect()))
                    .map(QuestionOption::getText)
                    .collect(Collectors.joining(", "));
            
            case FILL_IN:
                return question.getCorrectAnswer();
            
            default:
                return "[Unknown]";
        }
    }

    private double calculateEarnedPoints(Question question, StudentAnswer answer) {
        // Simplified calculation - use same logic as auto-grading
        switch (question.getType()) {
            case MULTIPLE_CHOICE:
            case TRUE_FALSE:
                return gradeMultipleChoice(question, answer);
            
            case FILL_IN:
                return gradeFillIn(question, answer);
            
            default:
                return 0.0;
        }
    }

    private double gradeMultipleChoice(Question question, StudentAnswer answer) {
        if (answer.getSelectedOptions() == null || answer.getSelectedOptions().isEmpty()) {
            return 0.0;
        }
        
        List<Integer> correctIndices = new java.util.ArrayList<>();
        for (int i = 0; i < question.getOptions().size(); i++) {
            if (Boolean.TRUE.equals(question.getOptions().get(i).getIsCorrect())) {
                correctIndices.add(i);
            }
        }
        
        if (correctIndices.size() == answer.getSelectedOptions().size() 
            && correctIndices.containsAll(answer.getSelectedOptions())) {
            return question.getPoints();
        }
        
        return 0.0;
    }

    private double gradeFillIn(Question question, StudentAnswer answer) {
        if (answer.getFillAnswer() == null || answer.getFillAnswer().trim().isEmpty()) {
            return 0.0;
        }
        
        if (question.getCorrectAnswer().equalsIgnoreCase(answer.getFillAnswer().trim())) {
            return question.getPoints();
        }
        
        return 0.0;
    }

    private ExamAttemptResponse mapToResponse(ExamAttempt attempt) {
        ExamAttemptResponse response = new ExamAttemptResponse();
        response.setId(attempt.getId());
        response.setExamId(attempt.getExamId());
        response.setStudentId(attempt.getStudentId());
        response.setStartTime(attempt.getStartTime());
        response.setEndTime(attempt.getEndTime());
        response.setSubmittedAt(attempt.getSubmittedAt());
        response.setAnswers(attempt.getAnswers());
        response.setTotalScore(attempt.getTotalScore());
        response.setAutoGradedScore(attempt.getAutoGradedScore());
        response.setManualGradedScore(attempt.getManualGradedScore());
        response.setStatus(attempt.getStatus());
        response.setGradedBy(attempt.getGradedBy());
        response.setGradedAt(attempt.getGradedAt());
        return response;
    }
}
