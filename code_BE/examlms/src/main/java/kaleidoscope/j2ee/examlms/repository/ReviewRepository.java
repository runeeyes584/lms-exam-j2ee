package kaleidoscope.j2ee.examlms.repository;

import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;

import kaleidoscope.j2ee.examlms.entity.Review;

public interface ReviewRepository extends MongoRepository<Review, String> {
    Page<Review> findByCourseIdAndIsDeletedFalse(String courseId, Pageable pageable);

    Optional<Review> findByCourseIdAndUserIdAndIsDeletedFalse(String courseId, String userId);

    long countByCourseIdAndIsDeletedFalse(String courseId);
}
