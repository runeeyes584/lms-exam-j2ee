package kaleidoscope.j2ee.examlms.repository;

import kaleidoscope.j2ee.examlms.entity.Exam;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ExamRepository extends MongoRepository<Exam, String> {
    
    // Find by course
    List<Exam> findByCourseId(String courseId);
    
    // Find published exams
    List<Exam> findByIsPublished(Boolean isPublished);
    
    // Find by course and published status
    List<Exam> findByCourseIdAndIsPublished(String courseId, Boolean isPublished);
    
    // Find by created by
    Page<Exam> findByCreatedBy(String createdBy, Pageable pageable);
    
    // Find all with pagination
    Page<Exam> findAll(Pageable pageable);
}
