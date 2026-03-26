package kaleidoscope.j2ee.examlms.service.impl;

import kaleidoscope.j2ee.examlms.dto.request.ManualGradeRequest;
import kaleidoscope.j2ee.examlms.dto.request.QuestionGradeRequest;
import kaleidoscope.j2ee.examlms.dto.response.ExamAttemptResponse;
import kaleidoscope.j2ee.examlms.dto.response.GradingDetailResponse;
import kaleidoscope.j2ee.examlms.entity.AttemptStatus;
import kaleidoscope.j2ee.examlms.entity.Exam;
import kaleidoscope.j2ee.examlms.entity.ExamAttempt;
import kaleidoscope.j2ee.examlms.entity.Question;
import kaleidoscope.j2ee.examlms.entity.QuestionOption;
import kaleidoscope.j2ee.examlms.entity.QuestionType;
import kaleidoscope.j2ee.examlms.entity.StudentAnswer;
import kaleidoscope.j2ee.examlms.entity.User;
import kaleidoscope.j2ee.examlms.repository.ExamAttemptRepository;
import kaleidoscope.j2ee.examlms.repository.ExamRepository;
import kaleidoscope.j2ee.examlms.repository.QuestionRepository;
import kaleidoscope.j2ee.examlms.repository.UserRepository;
import kaleidoscope.j2ee.examlms.service.GradingService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
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
    private final UserRepository userRepository;

    @Override
    public Page<ExamAttemptResponse> getAttemptsNeedingGrading(Pageable pageable) {
        Page<ExamAttempt> attempts = attemptRepository.findAll(pageable);

        List<ExamAttemptResponse> filtered = attempts.getContent().stream()
                .filter(a -> a.getStatus() == AttemptStatus.SUBMITTED)
                .map(this::mapToResponse)
                .collect(Collectors.toList());

        return new PageImpl<>(filtered, pageable, filtered.size());
    }

    @Override
    public Page<ExamAttemptResponse> getAttemptsNeedingGradingByExam(String examId, Pageable pageable) {
        Page<ExamAttempt> attempts = attemptRepository.findByExamId(examId, pageable);

        List<ExamAttemptResponse> filtered = attempts.getContent().stream()
                .filter(a -> a.getStatus() == AttemptStatus.SUBMITTED)
                .map(this::mapToResponse)
                .collect(Collectors.toList());

        return new PageImpl<>(filtered, pageable, filtered.size());
    }

    @Override
    public GradingDetailResponse getGradingDetails(String attemptId) {
        ExamAttempt attempt = attemptRepository.findById(attemptId)
                .orElseThrow(() -> new RuntimeException("Attempt not found with id: " + attemptId));

        Exam exam = examRepository.findById(attempt.getExamId())
                .orElseThrow(() -> new RuntimeException("Exam not found"));

        User student = userRepository.findById(attempt.getStudentId()).orElse(null);

        double maxScore = exam.getTotalPoints() != null ? exam.getTotalPoints() : 0.0;
        double totalScore = resolveTotalScore(attempt);
        double percentage = maxScore > 0 ? Math.round((totalScore / maxScore) * 10000.0) / 100.0 : 0.0;
        double passingScore = exam.getPassingScore() != null ? exam.getPassingScore() : 0.0;

        GradingDetailResponse response = GradingDetailResponse.builder()
                .attemptId(attempt.getId())
                .examId(attempt.getExamId())
                .examTitle(exam.getTitle())
                .studentId(attempt.getStudentId())
                .studentName(student != null ? student.getFullName() : "Hoc vien")
                .studentEmail(student != null ? student.getEmail() : "")
                .totalScore(totalScore)
                .maxScore(maxScore)
                .percentage(percentage)
                .status(attempt.getStatus() != null ? attempt.getStatus().name() : "SUBMITTED")
                .passed(percentage >= passingScore)
                .submittedAt(attempt.getSubmittedAt())
                .gradedAt(attempt.getGradedAt())
                .gradedBy(attempt.getGradedBy())
                .build();

        List<GradingDetailResponse.QuestionGradeDetail> questionGrades = new ArrayList<>();
        List<StudentAnswer> answers = attempt.getAnswers() != null ? attempt.getAnswers() : Collections.emptyList();
        for (StudentAnswer answer : answers) {
            Question question = questionRepository.findById(answer.getQuestionId()).orElse(null);
            if (question == null) {
                continue;
            }
            questionGrades.add(buildQuestionGradeDetail(question, answer));
        }

        response.setQuestionGrades(questionGrades);
        return response;
    }

    @Override
    public GradingDetailResponse gradeQuestion(String attemptId, QuestionGradeRequest request, String gradedBy) {
        ExamAttempt attempt = attemptRepository.findById(attemptId)
                .orElseThrow(() -> new RuntimeException("Attempt not found"));

        Question question = questionRepository.findById(request.getQuestionId())
                .orElseThrow(() -> new RuntimeException("Question not found"));

        if (request.getScore() > question.getPoints()) {
            throw new RuntimeException("Score cannot exceed maximum points: " + question.getPoints());
        }

        double currentManualScore = attempt.getManualGradedScore() != null ? attempt.getManualGradedScore() : 0.0;
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

        double manualScore = 0.0;

        for (Map.Entry<String, Double> entry : request.getQuestionScores().entrySet()) {
            String questionId = entry.getKey();
            Double score = entry.getValue();

            Question question = questionRepository.findById(questionId)
                    .orElseThrow(() -> new RuntimeException("Question not found: " + questionId));

            if (score > question.getPoints()) {
                throw new RuntimeException("Score for question " + questionId +
                        " cannot exceed max points: " + question.getPoints());
            }

            manualScore += score;
        }

        attempt.setManualGradedScore(manualScore);

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

    private GradingDetailResponse.QuestionGradeDetail buildQuestionGradeDetail(Question question, StudentAnswer answer) {
        double earnedPoints = calculateEarnedPoints(question, answer);
        double maxPoints = question.getPoints() != null ? question.getPoints() : 0.0;
        boolean isCorrect = maxPoints > 0 && Math.abs(earnedPoints - maxPoints) < 1e-6;

        return GradingDetailResponse.QuestionGradeDetail.builder()
                .questionId(question.getId())
                .questionContent(question.getContent())
                .questionType(question.getType() != null ? question.getType().name() : "UNKNOWN")
                .maxPoints(maxPoints)
                .earnedPoints(earnedPoints)
                .selectedOptions(extractSelectedTexts(question, answer))
                .correctOptions(extractCorrectTexts(question))
                .isCorrect(isCorrect)
                .feedback(question.getExplanation())
                .build();
    }

    private List<String> extractSelectedTexts(Question question, StudentAnswer answer) {
        if (question.getType() == QuestionType.FILL_IN) {
            return answer.getFillAnswer() == null || answer.getFillAnswer().trim().isEmpty()
                    ? Collections.emptyList()
                    : List.of(answer.getFillAnswer().trim());
        }

        if (answer.getSelectedOptions() == null || answer.getSelectedOptions().isEmpty()) {
            return Collections.emptyList();
        }

        return answer.getSelectedOptions().stream()
                .map(index -> (index >= 0 && index < question.getOptions().size())
                        ? question.getOptions().get(index).getText()
                        : null)
                .filter(value -> value != null && !value.isBlank())
                .collect(Collectors.toList());
    }

    private List<String> extractCorrectTexts(Question question) {
        if (question.getType() == QuestionType.FILL_IN) {
            return question.getCorrectAnswer() == null || question.getCorrectAnswer().isBlank()
                    ? Collections.emptyList()
                    : List.of(question.getCorrectAnswer());
        }

        if (question.getOptions() == null || question.getOptions().isEmpty()) {
            return Collections.emptyList();
        }

        return question.getOptions().stream()
                .filter(option -> Boolean.TRUE.equals(option.getIsCorrect()))
                .map(QuestionOption::getText)
                .filter(value -> value != null && !value.isBlank())
                .collect(Collectors.toList());
    }

    private double calculateEarnedPoints(Question question, StudentAnswer answer) {
        switch (question.getType()) {
            case SINGLE_CHOICE:
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

        List<Integer> correctIndices = new ArrayList<>();
        for (int i = 0; i < question.getOptions().size(); i++) {
            if (Boolean.TRUE.equals(question.getOptions().get(i).getIsCorrect())) {
                correctIndices.add(i);
            }
        }

        if (correctIndices.size() == answer.getSelectedOptions().size()
                && correctIndices.containsAll(answer.getSelectedOptions())) {
            return question.getPoints() != null ? question.getPoints() : 0.0;
        }

        return 0.0;
    }

    private double gradeFillIn(Question question, StudentAnswer answer) {
        if (answer.getFillAnswer() == null || answer.getFillAnswer().trim().isEmpty()) {
            return 0.0;
        }

        if (question.getCorrectAnswer() != null
                && question.getCorrectAnswer().equalsIgnoreCase(answer.getFillAnswer().trim())) {
            return question.getPoints() != null ? question.getPoints() : 0.0;
        }

        return 0.0;
    }

    private double resolveTotalScore(ExamAttempt attempt) {
        if (attempt.getTotalScore() != null) {
            return attempt.getTotalScore();
        }

        double autoScore = attempt.getAutoGradedScore() != null ? attempt.getAutoGradedScore() : 0.0;
        double manualScore = attempt.getManualGradedScore() != null ? attempt.getManualGradedScore() : 0.0;
        return autoScore + manualScore;
    }

    private ExamAttemptResponse mapToResponse(ExamAttempt attempt) {
        ExamAttemptResponse response = new ExamAttemptResponse();
        response.setId(attempt.getId());
        response.setExamId(attempt.getExamId());
        response.setStudentId(attempt.getStudentId());
        response.setStudentName(userRepository.findById(attempt.getStudentId()).map(User::getFullName).orElse(null));
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
