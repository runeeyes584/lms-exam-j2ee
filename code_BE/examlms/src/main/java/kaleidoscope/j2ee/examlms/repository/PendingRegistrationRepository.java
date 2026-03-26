package kaleidoscope.j2ee.examlms.repository;

import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;

import kaleidoscope.j2ee.examlms.entity.PendingRegistration;

public interface PendingRegistrationRepository extends MongoRepository<PendingRegistration, String> {
    Optional<PendingRegistration> findByEmail(String email);

    void deleteByEmail(String email);
}
