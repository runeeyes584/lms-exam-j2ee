package kaleidoscope.j2ee.examlms.repository;

import kaleidoscope.j2ee.examlms.entity.Certificate;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;
import java.util.List;

public interface CertificateRepository extends MongoRepository<Certificate, String> {

    Optional<Certificate> findByUserIdAndCourseId(String userId, String courseId);

    List<Certificate> findByUserId(String userId);

}
