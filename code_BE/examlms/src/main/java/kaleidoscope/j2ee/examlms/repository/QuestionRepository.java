package kaleidoscope.j2ee.examlms.repository;

import kaleidoscope.j2ee.examlms.entity.DifficultyLevel;
import kaleidoscope.j2ee.examlms.entity.Question;
import kaleidoscope.j2ee.examlms.entity.QuestionType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QuestionRepository extends MongoRepository<Question, String> {
    
    // Find by topic
    List<Question> findByTopicsContaining(String topic);
    
    // Find by difficulty
    List<Question> findByDifficulty(DifficultyLevel difficulty);
    
    // Find by type
    List<Question> findByType(QuestionType type);
    
    // Find by topic and difficulty
    List<Question> findByTopicsContainingAndDifficulty(String topic, DifficultyLevel difficulty);
    
    // Find by multiple topics (any match)
    @Query("{ 'topics': { $in: ?0 } }")
    List<Question> findByTopicsIn(List<String> topics);
    
    // Find by topics and difficulty
    @Query("{ 'topics': { $in: ?0 }, 'difficulty': ?1 }")
    List<Question> findByTopicsInAndDifficulty(List<String> topics, DifficultyLevel difficulty);
    
    // Find by creator ids
    @Query("{ 'created_by': { $in: ?0 } }")
    Page<Question> findByCreatedByIn(List<String> createdByValues, Pageable pageable);
    
    // Find all with pagination
    Page<Question> findAll(Pageable pageable);
}
