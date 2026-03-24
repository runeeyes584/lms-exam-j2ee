package kaleidoscope.j2ee.examlms.service.impl;

import kaleidoscope.j2ee.examlms.dto.request.QuestionCreateRequest;
import kaleidoscope.j2ee.examlms.dto.response.QuestionResponse;
import kaleidoscope.j2ee.examlms.entity.DifficultyLevel;
import kaleidoscope.j2ee.examlms.entity.Question;
import kaleidoscope.j2ee.examlms.entity.QuestionType;
import kaleidoscope.j2ee.examlms.repository.QuestionRepository;
import kaleidoscope.j2ee.examlms.service.QuestionService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class QuestionServiceImpl implements QuestionService {
    
    private final QuestionRepository questionRepository;
    
    @Override
    public QuestionResponse createQuestion(QuestionCreateRequest request, String createdBy) {
        validateQuestionRequest(request);
        
        Question question = new Question();
        question.setType(request.getType());
        question.setContent(request.getContent());
        question.setImageUrl(request.getImageUrl());
        question.setOptions(request.getOptions());
        question.setCorrectAnswer(request.getCorrectAnswer());
        question.setExplanation(request.getExplanation());
        question.setDifficulty(request.getDifficulty());
        question.setTopics(request.getTopics());
        question.setPoints(request.getPoints());
        question.setCreatedBy(createdBy);
        question.setCreatedAt(LocalDateTime.now());
        question.setUpdatedAt(LocalDateTime.now());
        
        Question saved = questionRepository.save(question);
        return mapToResponse(saved);
    }
    
    @Override
    public QuestionResponse updateQuestion(String id, QuestionCreateRequest request) {
        validateQuestionRequest(request);
        
        Question question = questionRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Question not found with id: " + id));
        
        question.setType(request.getType());
        question.setContent(request.getContent());
        question.setImageUrl(request.getImageUrl());
        question.setOptions(request.getOptions());
        question.setCorrectAnswer(request.getCorrectAnswer());
        question.setExplanation(request.getExplanation());
        question.setDifficulty(request.getDifficulty());
        question.setTopics(request.getTopics());
        question.setPoints(request.getPoints());
        question.setUpdatedAt(LocalDateTime.now());
        
        Question updated = questionRepository.save(question);
        return mapToResponse(updated);
    }
    
    @Override
    public void deleteQuestion(String id) {
        if (!questionRepository.existsById(id)) {
            throw new RuntimeException("Question not found with id: " + id);
        }
        questionRepository.deleteById(id);
    }
    
    @Override
    public QuestionResponse getQuestionById(String id) {
        Question question = questionRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Question not found with id: " + id));
        return mapToResponse(question);
    }
    
    @Override
    public Page<QuestionResponse> getAllQuestions(Pageable pageable) {
        return questionRepository.findAll(pageable)
            .map(this::mapToResponse);
    }
    
    @Override
    public List<QuestionResponse> searchByTopics(List<String> topics) {
        return questionRepository.findByTopicsIn(topics)
            .stream()
            .map(this::mapToResponse)
            .collect(Collectors.toList());
    }
    
    @Override
    public List<QuestionResponse> searchByDifficulty(DifficultyLevel difficulty) {
        return questionRepository.findByDifficulty(difficulty)
            .stream()
            .map(this::mapToResponse)
            .collect(Collectors.toList());
    }
    
    @Override
    public List<QuestionResponse> searchByTopicsAndDifficulty(List<String> topics, DifficultyLevel difficulty) {
        return questionRepository.findByTopicsInAndDifficulty(topics, difficulty)
            .stream()
            .map(this::mapToResponse)
            .collect(Collectors.toList());
    }
    
    @Override
    public List<QuestionResponse> searchByType(QuestionType type) {
        return questionRepository.findByType(type)
            .stream()
            .map(this::mapToResponse)
            .collect(Collectors.toList());
    }
    
    @Override
    public Page<QuestionResponse> getQuestionsByCreator(String createdBy, Pageable pageable) {
        List<String> visibleCreators = new ArrayList<>();
        if (createdBy != null && !createdBy.isBlank()) {
            visibleCreators.add(createdBy);
        }
        visibleCreators.add("excel-import");

        return questionRepository.findByCreatedByIn(visibleCreators, pageable)
            .map(this::mapToResponse);
    }
    
    private void validateQuestionRequest(QuestionCreateRequest request) {
        // Validate based on question type
        switch (request.getType()) {
            case SINGLE_CHOICE:
            case MULTIPLE_CHOICE:
                if (request.getOptions() == null || request.getOptions().isEmpty()) {
                    throw new RuntimeException("Multiple choice questions must have options");
                }
                long correctCount = request.getOptions().stream()
                    .filter(opt -> opt.getIsCorrect() != null && opt.getIsCorrect())
                    .count();
                if (request.getType() == QuestionType.SINGLE_CHOICE && correctCount != 1) {
                    throw new RuntimeException("Single choice questions must have exactly one correct answer");
                }
                if (request.getType() == QuestionType.MULTIPLE_CHOICE && correctCount < 1) {
                    throw new RuntimeException("Multiple choice questions must have at least one correct answer");
                }
                break;
            case TRUE_FALSE:
                if (request.getOptions() == null || request.getOptions().size() != 2) {
                    throw new RuntimeException("True/False questions must have exactly 2 options");
                }
                break;
            case FILL_IN:
                if (request.getCorrectAnswer() == null || request.getCorrectAnswer().trim().isEmpty()) {
                    throw new RuntimeException("Fill-in questions must have a correct answer");
                }
                break;
        }
        
        // Validate image URL format if provided
        if (request.getImageUrl() != null && !request.getImageUrl().isEmpty()) {
            if (!request.getImageUrl().matches("^https?://.*")) {
                throw new RuntimeException("Invalid image URL format");
            }
        }
        
        // Validate option image URLs
        if (request.getOptions() != null) {
            for (var option : request.getOptions()) {
                if (option.getImageUrl() != null && !option.getImageUrl().isEmpty()) {
                    if (!option.getImageUrl().matches("^https?://.*")) {
                        throw new RuntimeException("Invalid option image URL format");
                    }
                }
            }
        }
    }
    
    private QuestionResponse mapToResponse(Question question) {
        QuestionResponse response = new QuestionResponse();
        response.setId(question.getId());
        response.setType(question.getType());
        response.setContent(question.getContent());
        response.setImageUrl(question.getImageUrl());
        response.setOptions(question.getOptions());
        response.setCorrectAnswer(question.getCorrectAnswer());
        response.setExplanation(question.getExplanation());
        response.setDifficulty(question.getDifficulty());
        response.setTopics(question.getTopics());
        response.setPoints(question.getPoints());
        response.setCreatedBy(question.getCreatedBy());
        response.setCreatedAt(question.getCreatedAt());
        response.setUpdatedAt(question.getUpdatedAt());
        return response;
    }
}
