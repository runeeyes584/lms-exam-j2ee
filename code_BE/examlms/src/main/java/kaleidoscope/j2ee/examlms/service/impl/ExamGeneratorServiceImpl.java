package kaleidoscope.j2ee.examlms.service.impl;

import kaleidoscope.j2ee.examlms.dto.request.ExamGenerateRequest;
import kaleidoscope.j2ee.examlms.dto.response.ExamResponse;
import kaleidoscope.j2ee.examlms.entity.*;
import kaleidoscope.j2ee.examlms.repository.ExamRepository;
import kaleidoscope.j2ee.examlms.repository.QuestionRepository;
import kaleidoscope.j2ee.examlms.service.ExamGeneratorService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ExamGeneratorServiceImpl implements ExamGeneratorService {

    private final ExamRepository examRepository;
    private final QuestionRepository questionRepository;
    private final Random random = new Random();

    @Override
    public ExamResponse generateExam(ExamGenerateRequest request, String createdBy) {
        log.info("Generating exam: {} for topics: {}", request.getTitle(), request.getTopics());
        
        // Validate difficulty distribution
        validateDifficultyDistribution(request.getDifficultyDistribution());
        
        // Generate question list based on matrix
        List<ExamQuestion> examQuestions = generateQuestionList(
            request.getTopics(),
            request.getDifficultyDistribution()
        );
        
        if (examQuestions.isEmpty()) {
            throw new RuntimeException("Not enough questions available for the requested criteria");
        }
        
        // Calculate total points
        Double totalPoints = calculateTotalPoints(examQuestions);
        
        // Create exam
        Exam exam = new Exam();
        exam.setTitle(request.getTitle());
        exam.setDescription(request.getDescription());
        exam.setCourseId(request.getCourseId());
        exam.setDuration(request.getDuration());
        exam.setPassingScore(request.getPassingScore());
        exam.setTotalPoints(totalPoints);
        exam.setQuestions(examQuestions);
        exam.setGenerationType(GenerationType.AUTO);
        exam.setIsPublished(false);
        exam.setCreatedBy(createdBy);
        exam.setCreatedAt(LocalDateTime.now());
        exam.setUpdatedAt(LocalDateTime.now());
        
        Exam savedExam = examRepository.save(exam);
        log.info("Generated exam: {} with {} questions, total points: {}", 
            savedExam.getId(), examQuestions.size(), totalPoints);
        
        return mapToResponse(savedExam);
    }

    private void validateDifficultyDistribution(Map<DifficultyLevel, Integer> distribution) {
        if (distribution == null || distribution.isEmpty()) {
            throw new RuntimeException("Difficulty distribution is required");
        }
        
        for (Map.Entry<DifficultyLevel, Integer> entry : distribution.entrySet()) {
            if (entry.getValue() < 0) {
                throw new RuntimeException("Question count cannot be negative for difficulty: " + entry.getKey());
            }
        }
        
        int totalQuestions = distribution.values().stream()
            .mapToInt(Integer::intValue)
            .sum();
        
        if (totalQuestions == 0) {
            throw new RuntimeException("Total question count must be greater than 0");
        }
    }

    private List<ExamQuestion> generateQuestionList(
            List<String> topics, 
            Map<DifficultyLevel, Integer> difficultyDistribution) {
        
        List<ExamQuestion> selectedQuestions = new ArrayList<>();
        Set<String> usedQuestionIds = new HashSet<>();
        int order = 1;
        
        // For each difficulty level
        for (Map.Entry<DifficultyLevel, Integer> entry : difficultyDistribution.entrySet()) {
            DifficultyLevel difficulty = entry.getKey();
            int requiredCount = entry.getValue();
            
            if (requiredCount == 0) {
                continue;
            }
            
            log.info("Selecting {} questions for difficulty: {}", requiredCount, difficulty);
            
            // Find questions matching criteria
            List<Question> candidates = questionRepository
                .findByTopicsInAndDifficulty(topics, difficulty);
            
            // Remove already used questions
            candidates = candidates.stream()
                .filter(q -> !usedQuestionIds.contains(q.getId()))
                .collect(Collectors.toList());
            
            if (candidates.size() < requiredCount) {
                log.warn("Not enough questions for difficulty {}. Required: {}, Available: {}", 
                    difficulty, requiredCount, candidates.size());
            }
            
            // Randomly select questions
            List<Question> selected = selectRandomQuestions(candidates, requiredCount);
            
            // Add to exam
            for (Question question : selected) {
                ExamQuestion examQuestion = new ExamQuestion();
                examQuestion.setQuestionId(question.getId());
                examQuestion.setOrder(order++);
                selectedQuestions.add(examQuestion);
                usedQuestionIds.add(question.getId());
            }
        }
        
        // Shuffle questions if needed (optional)
        // Collections.shuffle(selectedQuestions);
        
        return selectedQuestions;
    }

    private List<Question> selectRandomQuestions(List<Question> candidates, int count) {
        if (candidates.isEmpty()) {
            return new ArrayList<>();
        }
        
        // If we need more than available, return all
        if (count >= candidates.size()) {
            return new ArrayList<>(candidates);
        }
        
        // Shuffle and take first N
        List<Question> shuffled = new ArrayList<>(candidates);
        Collections.shuffle(shuffled, random);
        return shuffled.subList(0, count);
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
