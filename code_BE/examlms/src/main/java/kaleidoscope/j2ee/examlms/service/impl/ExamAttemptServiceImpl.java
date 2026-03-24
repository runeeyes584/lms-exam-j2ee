package kaleidoscope.j2ee.examlms.service.impl;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import kaleidoscope.j2ee.examlms.dto.request.ExamSubmitRequest;
import kaleidoscope.j2ee.examlms.dto.response.ExamAttemptResponse;
import kaleidoscope.j2ee.examlms.entity.AttemptStatus;
import kaleidoscope.j2ee.examlms.entity.Exam;
import kaleidoscope.j2ee.examlms.entity.ExamAttempt;
import kaleidoscope.j2ee.examlms.entity.Question;
import kaleidoscope.j2ee.examlms.entity.StudentAnswer;
import kaleidoscope.j2ee.examlms.repository.ExamAttemptRepository;
import kaleidoscope.j2ee.examlms.repository.ExamRepository;
import kaleidoscope.j2ee.examlms.repository.QuestionRepository;
import kaleidoscope.j2ee.examlms.service.ExamAttemptService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class ExamAttemptServiceImpl implements ExamAttemptService {

    private final ExamAttemptRepository attemptRepository;
    private final ExamRepository examRepository;
    private final QuestionRepository questionRepository;

    @Override
    public ExamAttemptResponse startExam(String examId, String studentId) {
        // Validate exam exists and is published
        Exam exam = examRepository.findById(examId)
                .orElseThrow(() -> new RuntimeException("Exam not found with id: " + examId));

        if (!exam.getIsPublished()) {
            throw new RuntimeException("Exam is not published yet");
        }

        // Check if student already has an in-progress attempt
        Optional<ExamAttempt> existingAttempt = attemptRepository
                .findByExamIdAndStudentIdAndStatus(examId, studentId, AttemptStatus.IN_PROGRESS);

        if (existingAttempt.isPresent()) {
            throw new RuntimeException("You already have an in-progress attempt for this exam");
        }

        // Create new attempt
        ExamAttempt attempt = new ExamAttempt();
        attempt.setExamId(examId);
        attempt.setStudentId(studentId);
        attempt.setStartTime(LocalDateTime.now());
        attempt.setEndTime(LocalDateTime.now().plusMinutes(exam.getDuration()));
        attempt.setStatus(AttemptStatus.IN_PROGRESS);

        ExamAttempt savedAttempt = attemptRepository.save(attempt);
        log.info("Student {} started exam {} with attempt {}", studentId, examId, savedAttempt.getId());

        return mapToResponse(savedAttempt);
    }

    @Override
    public ExamAttemptResponse saveProgress(String attemptId, List<StudentAnswer> answers) {
        ExamAttempt attempt = attemptRepository.findById(attemptId)
                .orElseThrow(() -> new RuntimeException("Attempt not found with id: " + attemptId));

        if (attempt.getStatus() != AttemptStatus.IN_PROGRESS) {
            throw new RuntimeException("Cannot save progress. Exam is already submitted.");
        }

        // Check if time has expired
        if (LocalDateTime.now().isAfter(attempt.getEndTime())) {
            // Auto-submit if time expired
            log.info("Time expired for attempt {}. Auto-submitting...", attemptId);
            ExamSubmitRequest submitRequest = new ExamSubmitRequest(answers);
            return submitExam(attemptId, submitRequest);
        }

        // Save progress
        attempt.setAnswers(answers);
        ExamAttempt savedAttempt = attemptRepository.save(attempt);

        log.debug("Saved progress for attempt {}: {} answers", attemptId, answers.size());

        return mapToResponse(savedAttempt);
    }

    @Override
    public ExamAttemptResponse submitExam(String attemptId, ExamSubmitRequest request) {
        ExamAttempt attempt = attemptRepository.findById(attemptId)
                .orElseThrow(() -> new RuntimeException("Attempt not found with id: " + attemptId));

        if (attempt.getStatus() != AttemptStatus.IN_PROGRESS) {
            throw new RuntimeException("Exam is already submitted");
        }

        // Check if time expired
        boolean isLateSubmission = LocalDateTime.now().isAfter(attempt.getEndTime());
        if (isLateSubmission) {
            log.warn("Late submission for attempt {}", attemptId);
        }

        // Save final answers
        attempt.setAnswers(request.getAnswers());
        attempt.setSubmittedAt(LocalDateTime.now());
        attempt.setStatus(AttemptStatus.SUBMITTED);

        // Auto-grade
        double autoGradedScore = performAutoGrading(attempt);
        attempt.setAutoGradedScore(autoGradedScore);

        // If no manual grading needed, set as GRADED
        if (!needsManualGrading(attempt)) {
            attempt.setStatus(AttemptStatus.GRADED);
            attempt.setTotalScore(autoGradedScore);
            attempt.setManualGradedScore(0.0);
        }

        ExamAttempt savedAttempt = attemptRepository.save(attempt);
        log.info("Submitted and graded attempt {}: autoScore={}, status={}",
                attemptId, autoGradedScore, savedAttempt.getStatus());

        return mapToResponse(savedAttempt);
    }

    @Override
    public ExamAttemptResponse getAttemptById(String attemptId) {
        ExamAttempt attempt = attemptRepository.findById(attemptId)
                .orElseThrow(() -> new RuntimeException("Attempt not found with id: " + attemptId));
        return mapToResponse(attempt);
    }

    @Override
    public Page<ExamAttemptResponse> getMyAttempts(String studentId, Pageable pageable) {
        Page<ExamAttempt> attempts = attemptRepository.findAll(pageable);
        // Filter by studentId in application (MongoDB query method exists but using
        // Page)
        return (Page<ExamAttemptResponse>) attempts
                .filter(a -> a.getStudentId().equals(studentId))
                .map(this::mapToResponse);
    }

    @Override
    public Page<ExamAttemptResponse> getAttemptsByExam(String examId, Pageable pageable) {
        Page<ExamAttempt> attempts = attemptRepository.findByExamId(examId, pageable);
        return attempts.map(this::mapToResponse);
    }

    @Override
    public ExamAttemptResponse getAttemptForReview(String attemptId, String studentId) {
        ExamAttempt attempt = attemptRepository.findById(attemptId)
                .orElseThrow(() -> new RuntimeException("Attempt not found with id: " + attemptId));

        // Verify this attempt belongs to the student
        if (!attempt.getStudentId().equals(studentId)) {
            throw new RuntimeException("This attempt does not belong to you");
        }

        // Only allow review if exam is submitted or graded
        if (attempt.getStatus() == AttemptStatus.IN_PROGRESS) {
            throw new RuntimeException("Cannot review. Exam is still in progress.");
        }

        return mapToResponse(attempt);
    }

    /**
     * Auto-grade multiple choice, true/false, and fill-in questions
     */
    private double performAutoGrading(ExamAttempt attempt) {
        Exam exam = examRepository.findById(attempt.getExamId())
                .orElseThrow(() -> new RuntimeException("Exam not found"));

        double totalScore = 0.0;

        for (StudentAnswer answer : attempt.getAnswers()) {
            Question question = questionRepository.findById(answer.getQuestionId())
                    .orElse(null);

            if (question == null) {
                continue;
            }

            double score = gradeQuestion(question, answer);
            totalScore += score;
        }

        return totalScore;
    }

    private double gradeQuestion(Question question, StudentAnswer answer) {
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

        // Get correct option indices
        List<Integer> correctIndices = new java.util.ArrayList<>();
        for (int i = 0; i < question.getOptions().size(); i++) {
            if (Boolean.TRUE.equals(question.getOptions().get(i).getIsCorrect())) {
                correctIndices.add(i);
            }
        }

        // Check if student's answer matches correct answer
        List<Integer> studentAnswers = answer.getSelectedOptions();

        if (correctIndices.size() == studentAnswers.size()
                && correctIndices.containsAll(studentAnswers)) {
            return question.getPoints();
        }

        return 0.0;
    }

    private double gradeFillIn(Question question, StudentAnswer answer) {
        if (answer.getFillAnswer() == null || answer.getFillAnswer().trim().isEmpty()) {
            return 0.0;
        }

        String correctAnswer = question.getCorrectAnswer();
        String studentAnswer = answer.getFillAnswer().trim();

        // Case-insensitive comparison
        if (correctAnswer.equalsIgnoreCase(studentAnswer)) {
            return question.getPoints();
        }

        // Could add partial matching logic here
        // For now, exact match only
        return 0.0;
    }

    private boolean needsManualGrading(ExamAttempt attempt) {
        // For now, all questions can be auto-graded
        // In future, essay questions would need manual grading
        return false;
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
