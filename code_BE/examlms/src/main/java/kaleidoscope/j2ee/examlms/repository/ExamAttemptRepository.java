package kaleidoscope.j2ee.examlms.repository;

import kaleidoscope.j2ee.examlms.entity.AttemptStatus;
import kaleidoscope.j2ee.examlms.entity.ExamAttempt;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ExamAttemptRepository extends MongoRepository<ExamAttempt, String> {
    
    // Find by student
    List<ExamAttempt> findByStudentId(String studentId);

    // Find by student with pagination
    Page<ExamAttempt> findByStudentId(String studentId, Pageable pageable);
    
    // Find by exam
    List<ExamAttempt> findByExamId(String examId);
    
    // Find by exam and student
    List<ExamAttempt> findByExamIdAndStudentId(String examId, String studentId);
    
    // Find by student and status
    List<ExamAttempt> findByStudentIdAndStatus(String studentId, AttemptStatus status);
    
    // Find by exam and status
    List<ExamAttempt> findByExamIdAndStatus(String examId, AttemptStatus status);
    
    // Check if student has in-progress attempt for exam
    Optional<ExamAttempt> findByExamIdAndStudentIdAndStatus(
        String examId, 
        String studentId, 
        AttemptStatus status
    );
    
    // Find all attempts for an exam with pagination (for instructors)
    Page<ExamAttempt> findByExamId(String examId, Pageable pageable);
}
